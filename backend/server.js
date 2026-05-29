require("dotenv").config();
const { Resend } = require('resend');
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = express();
const { getSheet } = require('./sheets.js');

const resend = new Resend(process.env.resendAPI);

app.use(cors());
app.use(express.json());

//Para conectarse a mongo, la base de datos de los usuarios
mongoose.connect(process.env.mongo)
    .then(() => console.log("Mongo conectado"))
    .catch(err => console.log(err));


//Como se van a guardar los usuarios
const usuarioSchema = new mongoose.Schema({
    nombre: String,
    apellido: String,
    email: String,
    password: String,
    cuenta: String,
    verificado: {
        type: Boolean,
        default: false
    }
});

//creamos el modelo de usuario
const Usuario = mongoose.model("Usuario", usuarioSchema);

//Aqui registramos el usuario, esto guarda al usuario en la base de datos y le manda el correo de verificacion
app.post("/registro", async (req, res) => {
    const { email, password, nombre, apellido } = req.body;
    console.log(email, nombre, apellido);

    try {
        const hash = await bcrypt.hash(password, 10); //encriptamos la contraseña

        const usuario = await Usuario.findOne({ email });

        if (usuario) {
            return res.status(400).json({ error: "Usuario ya existe" });
        }else{
            const nuevoUsuario = new Usuario({
            nombre,
            apellido,
            email,
            password: hash,
            cuenta: "Alumno" //simpre va a ser alumno. hasta que algun administrador lo cambie
        });

        await nuevoUsuario.save();

        const token = jwt.sign(
        { id: nuevoUsuario._id },
        process.env.tokenSecret,
        { expiresIn: "1d" }
    );
    console.log("enviando correo ...")
    const link = `${process.env.URL}/verificar/${token}`; //aqui se crea el link para verficar al usuairio

    await resend.emails.send({ //aqui se manda el correo
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Verficación de email - Observatorio Laboral UP',
        html: `
            <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:10px; text-align:center;">

                <h2>¡Gracias por registrarte en el observatorio laboral!</h2>

                <p style="font-size:16px; color:#555;">
                    Apreciamos tu interés por formar parte de nuestro proyecto.
                </p>

                <p style="font-size:16px; color:#555;">
                    Para completar tu registro y activar tu cuenta, haz clic en el botón de abajo:
                </p>

                <div style="margin:30px 0;">
                    <a href="${link}" 
                    style="background:rgb(211, 167, 54); color:white; padding:12px 25px; text-decoration:none; border-radius:5px; font-size:16px;">
                    Activar Cuenta
                    </a>
                </div>

                <p style="font-size:14px; color:#777;">
                    Si tú no realizaste este registro, puedes ignorar este correo.
                </p>

            </div>
        `,
    });

    console.log("Correo enviado correctamente a:", email);
    res.json({ mensaje: "Usuario creado. Revisa tu correo." });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al guardar usuario" });
    }
});

//Aqui se hace el login, se verifica que el usuario exista, que la contraseña sea correcta y que el correo este verificado
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ email }); //aqui se busca al usuario por su correo

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no existe" });
        }

        const esValida = await bcrypt.compare(password, usuario.password);

        if (!esValida) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        if (!usuario.verificado) {
            return res.status(401).json({
                error: "Debes verificar tu correo"
            });
        }

        //creamos un token, pra que no se pueda entrar a la pagina sin estar logueado, el token tiene la informacion del usuario y un tiempo de expiracion
        const token = jwt.sign(
            {
                id: usuario._id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                cuenta: usuario.cuenta
            },
            process.env.tokenSecret,
            { expiresIn: "1h" }
        );

        res.json({ token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error en login" });
    }
});

//Aqui se inicia el servidor
app.listen(process.env.port, () => {
    console.log(`Servidor en ${process.env.URL}`);
});

//aqui se verifica que el usuario tenga token
function verificarToken(req, res, next) {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ error: "No autorizado" });
    }

    try {
        const decoded = jwt.verify(token, process.env.tokenSecret);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido" });
    }
}

//Aqui se obtiene el perfil del usuario
app.get("/perfil", verificarToken, (req, res) => {
    res.json({
        usuario: req.usuario,
        cuenta: req.usuario.cuenta
    });
});

//Aqui se obtiene la lista de usuarios, solo los administradores pueden acceder a esta ruta
app.get("/usuarios", verificarToken, async (req, res) => {
    try {
        const usuarios = await Usuario.find();

        res.json({ usuarios });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

//cuando se verifica el correo se actualiza el usuario y te redirige a la pagina de login
app.get("/verificar/:token", async (req, res) => {

    try {
        const data = jwt.verify(
            req.params.token,
            process.env.tokenSecret
        );

        await Usuario.findByIdAndUpdate(data.id, {
            verificado: true
        });

        res.redirect("https://observatorio-laboral.vercel.app/html/Login.html?msg=verificado");

    } catch (error) {
        res.send("Link inválido o expirado");
    }

});

//Aqui se elimina un usuario, solo los administradores pueden eliminar usuarios
app.delete("/usuarios/:id", verificarToken, async (req, res) => {
    try {
        if (req.usuario.cuenta !== "Admin") {
            return res.status(403).json({ error: "No tienes permisos de administrador" });
        }

        const id = req.params.id;
        const usuarioEliminado = await Usuario.findByIdAndDelete(id);

        if (!usuarioEliminado) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al eliminar el usuario" });
    }
});

//Aqui se actualiza el rol de un usuario, solo los administradores pueden cambiar el rol de un usuario
app.put("/usuarios/cuenta/:id", verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { cuenta } = req.body;

        if (req.usuario.cuenta !== "Admin") {
            return res.status(403).json({ error: "No tienes permisos para cambiar roles" });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID de usuario inválido" });
        }

        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            id, 
            { cuenta: cuenta }, 
            { new: true } 
        );

        if (!usuarioActualizado) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ 
            mensaje: "Cuenta actualizada con éxito", 
            usuario: usuarioActualizado 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar el usuario" });
    }
});

//Base de datos del QS
app.get('/qsData', async (req, res) => {
    try {
        const rows = await getSheet(process.env.IDSheetsQS, "'Respuestas de formulario 1'!A2:AD3600");

        if (!rows || rows.length === 0) return res.status(404).json([]);

        const data = rows.map(fila => ({
            campus: fila[10],
            carrera: fila[11],
            facultad: fila[28],
            trabaja: fila[17],
            sector: fila[23],
            semestre: fila[26],
            tipoContrato: fila[24],
            salario: fila[25],
            egreso: fila[29]
        }));

        res.json(data);
    } catch (error) {
        console.error("--- ERROR EN EL SERVIDOR1 ---");
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});

//Base de datos del Semaforo Laboral junio 2017
app.get('/Junio2017Data', async (req, res) => {
    try {
        const rows = await getSheet(process.env.IDSheets2017, "'JUNIO'!E2:Z372");

        if (!rows || rows.length === 0) return res.status(404).json([]);

        const data = rows.map(fila => ({
            carrera: fila[3],
            trabaja1: fila[7],
            trabaja2: fila[12],
            trabaja3: fila[17]
        }));

        res.json(data);
    } catch (error) {
        console.error("--- ERROR EN EL SERVIDOR2 ---");
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});

//Base de datos del Semaforo Laboral diciembre 2017
app.get('/Diciembre2017Data', async (req, res) => {
    try {
        const rows = await getSheet(process.env.IDSheets2017, "'DIC'!A2:X205");

        if (!rows || rows.length === 0) return res.status(404).json([]);

        const data = rows.map(fila => ({
            carrera: fila[2],
            trabaja1: fila[9],
            trabaja2: fila[14],
            trabaja3: fila[19]
        }));

        res.json(data);
    } catch (error) {
        console.error("--- ERROR EN EL SERVIDOR3 ---");
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});


//Base de datos del Semaforo Laboral junio 2018
app.get('/Junio2018Data', async (req, res) => {
    try {
        const rows = await getSheet(process.env.IDSheets2018, "'JUNIO'!A2:AU389");

        if (!rows || rows.length === 0) return res.status(404).json([]);

        const data = rows.map(fila => ({
            carrera: fila[6],
            trabaja1: fila[11],
            trabaja2: fila[20],
            trabaja3: fila[28],
            trabaja4: fila[35],
            trabaja5: fila[42]
        }));

        res.json(data);
    } catch (error) {
        console.error("--- ERROR EN EL SERVIDOR4 ---");
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});

//Base de datos del Semaforo Laboral diciembre 2018
app.get('/Diciembre2018Data', async (req, res) => {
    try {
        const rows = await getSheet(process.env.IDSheets2018, "'DIC'!A2:AU389");

        if (!rows || rows.length === 0) return res.status(404).json([]);

        const data = rows.map(fila => ({
            carrera: fila[6],
            trabaja1: fila[8],
            trabaja2: fila[16],
            trabaja3: fila[24]
        }));

        res.json(data);
    } catch (error) {
        console.error("--- ERROR EN EL SERVIDOR5 ---");
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});

//Base de datos del Semaforo Laboral junio 2020
app.get('/Junio2020Data', async (req, res) => {
    try {
        const rows = await getSheet(process.env.IDSheets2020, "'JUN'!A2:P412");

        if (!rows || rows.length === 0) return res.status(404).json([]);

        const data = rows.map(fila => ({
            carrera: fila[2],
            trabaja1: fila[10],
            trabaja2: fila[12],
            trabaja3: fila[14]
        }));

        res.json(data);
    } catch (error) {
        console.error("--- ERROR EN EL SERVIDOR5 ---");
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});

//Base de datos del Semaforo Laboral diciembre 2020
app.get('/Diciembre2020Data', async (req, res) => {
    try {
        const rows = await getSheet(process.env.IDSheets2020, "'DIC'!A2:P358");

        if (!rows || rows.length === 0) return res.status(404).json([]);

        const data = rows.map(fila => ({
            carrera: fila[2],
            trabaja1: fila[10],
            trabaja2: fila[12],
            trabaja3: fila[14]
        }));

        res.json(data);
    } catch (error) {
        console.error("--- ERROR EN EL SERVIDOR5 ---");
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});

//Base de datos del Semaforo Laboral junio 2021
app.get('/Junio2021Data', async (req, res) => {
    try {
        const rows = await getSheet(process.env.IDSheets2021, "'JUN'!A2:P412");

        if (!rows || rows.length === 0) return res.status(404).json([]);

        const data = rows.map(fila => ({
            carrera: fila[2],
            trabaja1: fila[10],
            trabaja2: fila[12],
            trabaja3: fila[14]
        }));

        res.json(data);
    } catch (error) {
        console.error("--- ERROR EN EL SERVIDOR6 ---");
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});
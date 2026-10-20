import nodemailer from 'nodemailer';

// Envía por correo el código de recuperación.
// Si no hay SMTP configurado y no estamos en producción, lo mostramos por consola para poder probar en local.
export const sendResetCode = async (to: string, code: string) => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Falta configurar SMTP_HOST, SMTP_USER y SMTP_PASS');
        }
        console.log(`[DEV] Código de recuperación para ${to}: ${code}`);
        return;
    }

    const port = Number(SMTP_PORT) || 465;
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure: port === 465, // 465 usa TLS directo; 587 negocia TLS después de conectar
        auth: { user: SMTP_USER, pass: SMTP_PASS }
    });

    // Importante en Vercel: hay que esperar (await) al envío antes de responder,
    // porque al devolver la respuesta la función serverless se congela
    await transporter.sendMail({
        from: MAIL_FROM || SMTP_USER,
        to,
        subject: 'Tu código para recuperar la contraseña',
        text: `Tu código de recuperación es ${code}. Caduca en 15 minutos. Si no lo has pedido tú, ignora este correo.`,
        html: `<p>Tu código de recuperación es:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px">${code}</p><p>Caduca en 15 minutos. Si no lo has pedido tú, ignora este correo.</p>`
    });
};

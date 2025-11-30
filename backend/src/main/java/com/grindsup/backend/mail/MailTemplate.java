package com.grindsup.backend.mail;

public class MailTemplate {

    public static String resetPasswordHtml(String link, int minutes) {

        String html = """
                <!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <title>Recuperar contraseña</title>
                </head>
                <body style="margin:0; padding:0; background:#007000; font-family:Arial, Helvetica, sans-serif;">
                  <table width="100%%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding:40px 0;">
                        <table width="90%%" max-width="600" cellspacing="0" cellpadding="0" 
                               style="background:white; border-radius:12px;">
                          <tr>
                            <td style="padding:40px 30px; text-align:center;">
                              
                              <h1 style="color:#258d19; margin:0; font-size:28px;">GrindSup</h1>
                              <h2 style="color:#333; font-weight:600; margin-top:5px;">Recuperar contraseña</h2>

                              <p style="color:#444; font-size:15px; margin-top:24px; line-height:1.6;">
                                Hola 👋<br><br>
                                Recibimos una solicitud para restablecer tu contraseña.
                                <br><br>
                                Hacé clic en el siguiente botón para continuar.<br>
                                Este enlace vence en <b>{{MINUTES}} minutos</b>.
                              </p>

                              <a href="{{LINK}}"
                                style="
                                  display:inline-block;
                                  background:#258d19;
                                  color:white;
                                  padding:14px 28px;
                                  border-radius:8px;
                                  margin:30px 0;
                                  text-decoration:none;
                                  font-size:16px;
                                  font-weight:bold;
                                ">
                                Restablecer contraseña
                              </a>

                              <p style="color:#777; font-size:13px; margin-top:20px; line-height:1.6;">
                                Si no fuiste vos, podés ignorar este mensaje. Tu contraseña no se modificará.
                              </p>

                              <hr style="margin:30px 0; border:none; border-top:1px solid #ddd;" />

                              <p style="color:#999; font-size:12px;">
                                © GrindSup – 2025<br>
                                Tu plataforma de entrenamiento inteligente 🏋️‍♂️
                              </p>

                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """;

        // Reemplazos seguros
        html = html.replace("{{LINK}}", link);
        html = html.replace("{{MINUTES}}", String.valueOf(minutes));

        return html;
    }
}

package com.grindsup.backend.mail;

public class MailTemplate {

    public static String resetPasswordHtml(String link, int minutes) {
        return """
        <html>
          <body style="font-family: Arial, sans-serif; background-color:#0d7c34; padding:30px;">
            <table width="100%%" cellpadding="0" cellspacing="0" 
                   style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden;">
              <tr>
                <td style="background-color:#0d7c34; color:#ffffff; text-align:center; padding:24px;">
                  <h1 style="margin:0;">GrindSup</h1>
                  <h2 style="margin:8px 0 0 0;">Recuperar contraseña</h2>
                </td>
              </tr>

              <tr>
                <td style="padding:24px; color:#111827; font-size:15px;">
                  <p>Hola!</p>
                  <p>Recibimos una solicitud para restablecer tu contraseña.</p>
                  <p>Hacé clic en el siguiente botón para continuar. Este enlace vence en 
                     <strong>%d minutos</strong>.</p>

                  <div style="text-align:center; margin:32px 0;">
                    <a href="%s" 
                       style="background-color:#000000; color:#ffffff; padding:14px 28px; 
                              text-decoration:none; font-weight:bold; border-radius:8px; 
                              display:inline-block;">
                      Restablecer contraseña
                    </a>
                  </div>

                  <p>Si no fuiste vos, podés ignorar este mensaje. Tu contraseña no se modificará.</p>
                </td>
              </tr>

              <tr>
                <td style="background-color:#0d7c34; color:#ffffff; text-align:center; padding:12px; font-size:12px;">
                  © GrindSup - %s
                </td>
              </tr>
            </table>
          </body>
        </html>
        """.formatted(minutes, link, java.time.Year.now());
    };
};
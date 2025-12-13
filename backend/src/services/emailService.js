const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw new Error('Failed to send email.');
  }
};

const sendVerificationCode = async (email, code, username) => {
  const subject = 'Vérifiez votre email - VotePoll';
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vérification Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <!-- Container principal -->
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">

              <!-- Header avec gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
                  <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="white"/>
                    </svg>
                  </div>
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">VotePoll</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Plateforme de sondages et votes</p>
                </td>
              </tr>

              <!-- Contenu principal -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px; font-weight: 600;">Bonjour ${username} ! 👋</h2>
                  <p style="color: #6b7280; margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
                    Merci de vous être inscrit sur <strong style="color: #6366f1;">VotePoll</strong>. Pour finaliser votre inscription, veuillez utiliser le code de vérification ci-dessous :
                  </p>

                  <!-- Code de vérification -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 12px; padding: 24px; display: inline-block;">
                          <p style="color: #6b7280; margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Votre code de vérification</p>
                          <p style="color: #6366f1; margin: 0; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</p>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Timer -->
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                    <p style="color: #92400e; margin: 0; font-size: 14px;">
                      ⏱️ <strong>Ce code expire dans 30 minutes.</strong> Veuillez l'utiliser rapidement.
                    </p>
                  </div>

                  <p style="color: #6b7280; margin: 24px 0 0; font-size: 14px; line-height: 1.6;">
                    Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet email en toute sécurité.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <p style="color: #9ca3af; margin: 0 0 8px; font-size: 13px;">
                          Cet email a été envoyé par <strong style="color: #6366f1;">VotePoll</strong>
                        </p>
                        <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                          © ${new Date().getFullYear()} VotePoll. Tous droits réservés.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  await sendEmail(email, subject, htmlContent);
};

const sendPasswordResetCode = async (email, code, username) => {
  const subject = 'Réinitialisation de votre mot de passe - VotePoll';
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Réinitialisation Mot de Passe</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">

              <!-- Header avec gradient rouge -->
              <tr>
                <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
                  <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="white"/>
                    </svg>
                  </div>
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">VotePoll</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Réinitialisation du mot de passe</p>
                </td>
              </tr>

              <!-- Contenu -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px; font-weight: 600;">Bonjour ${username} ! 🔐</h2>
                  <p style="color: #6b7280; margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
                    Vous avez demandé à réinitialiser votre mot de passe sur <strong style="color: #ef4444;">VotePoll</strong>. Utilisez le code ci-dessous pour continuer :
                  </p>

                  <!-- Code -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 12px; padding: 24px; display: inline-block;">
                          <p style="color: #991b1b; margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Code de réinitialisation</p>
                          <p style="color: #dc2626; margin: 0; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</p>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Warning -->
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                    <p style="color: #92400e; margin: 0; font-size: 14px;">
                      ⏱️ <strong>Ce code expire dans 30 minutes.</strong>
                    </p>
                  </div>

                  <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px; margin: 24px 0;">
                    <p style="color: #991b1b; margin: 0; font-size: 14px;">
                      ⚠️ <strong>Vous n'avez pas demandé cette réinitialisation ?</strong><br>
                      Ignorez cet email et votre mot de passe restera inchangé. Nous vous recommandons de sécuriser votre compte.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <p style="color: #9ca3af; margin: 0 0 8px; font-size: 13px;">
                          Cet email a été envoyé par <strong style="color: #6366f1;">VotePoll</strong>
                        </p>
                        <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                          © ${new Date().getFullYear()} VotePoll. Tous droits réservés.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  await sendEmail(email, subject, htmlContent);
};

const sendSupportNotification = async (adminEmail, data) => {
  const { subject, message, userId, userEmail, userName } = data;
  const emailSubject = `[Support VotePoll] ${subject}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Message Support</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                  <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="white"/>
                      <path d="M7 9H17V11H7V9ZM7 12H14V14H7V12ZM7 6H17V8H7V6Z" fill="white"/>
                    </svg>
                  </div>
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Nouveau Message Support</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">VotePoll - Centre d'aide</p>
                </td>
              </tr>

              <!-- Contenu -->
              <tr>
                <td style="padding: 40px 30px;">
                  <!-- Info utilisateur -->
                  <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <h3 style="color: #374151; margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Informations de l'utilisateur</h3>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 4px 0; color: #6b7280; font-size: 14px; width: 100px;">Nom:</td>
                        <td style="padding: 4px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${userName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Email:</td>
                        <td style="padding: 4px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
                          <a href="mailto:${userEmail}" style="color: #10b981; text-decoration: none;">${userEmail}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">ID:</td>
                        <td style="padding: 4px 0; color: #1f2937; font-size: 14px;">#${userId}</td>
                      </tr>
                    </table>
                  </div>

                  <!-- Sujet -->
                  <div style="margin-bottom: 24px;">
                    <h3 style="color: #374151; margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Sujet</h3>
                    <p style="color: #1f2937; margin: 0; font-size: 18px; font-weight: 600;">${subject}</p>
                  </div>

                  <!-- Message -->
                  <div style="background-color: #f9fafb; border-left: 4px solid #10b981; border-radius: 8px; padding: 20px;">
                    <h3 style="color: #374151; margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Message</h3>
                    <p style="color: #4b5563; margin: 0; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
                  </div>

                  <!-- Bouton répondre -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                    <tr>
                      <td align="center">
                        <a href="mailto:${userEmail}?subject=Re: ${subject}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">Répondre à ${userName}</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 24px; border-top: 1px solid #e5e7eb;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <p style="color: #9ca3af; margin: 0 0 8px; font-size: 13px;">
                          Message reçu le ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                          © ${new Date().getFullYear()} VotePoll. Tous droits réservés.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  await sendEmail(adminEmail, emailSubject, htmlContent);
};

module.exports = {
  sendVerificationCode,
  sendPasswordResetCode,
  sendSupportNotification,
};

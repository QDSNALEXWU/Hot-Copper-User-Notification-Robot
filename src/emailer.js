const nodemailer = require("nodemailer");

/**
 * Generate the formatted HTML 
 * @param {*} data 
 */
function generateHtml(data) {
    const rows = data.map(item => (
        `<tr>
            <td><a href="${item.url}">${item.title}</a></td>
            <td>${item.author}</td>
            <td>${item.time}</td>
        </tr>`
    )).join();

    const HTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
            table {
            font-family: arial, sans-serif;
            border-collapse: collapse;
            width: 100%;
            }
            
            td, th {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
            }
            
            tr:nth-child(even) {
            background-color: #dddddd;
            }
            </style>
        </head>
        <body>
            <h2>Posts from last ${process.env.INTERVAL} hours</h2>
            
            <table>
            <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Time</th>
            </tr>
                ${rows}
            </table>
        </body>
        </html>
    `
    return HTML
}

/**
 * Sending email using testing emialer
 * @param {} data 
 */
async function sendTestEmail(data) {
    // Generate SMTP service account from ethereal.email
    let account = await nodemailer.createTestAccount();

    console.log('Credentials obtained, sending message...');

    // NB! Store the account object values somewhere if you want
    // to re-use the same account for future mail deliveries

    // Create a SMTP transporter object
    let transporter = nodemailer.createTransport(
        {
            host: account.smtp.host,
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: {
                user: account.user,
                pass: account.pass
            },
            logger: false,
            debug: false // include SMTP traffic in the logs
        },
        {
            // default message fields

            // sender info
            from: 'Pangalink <no-reply@pangalink.net>',
            headers: {
                'X-Laziness-level': 1000 // just an example header, no need to use this
            }
        }
    );

    // Message object
    let message = {
        // Comma separated list of recipients
        to: process.env.SENDTO,
        // Subject of the message
        subject: 'Nodemailer is unicode friendly ✔',
        // plaintext body
        text: 'Hello to myself!',
        // HTML body
        html: generateHtml(data),

    };

    let info = await transporter.sendMail(message);

    console.log('Message sent successfully!');
    console.log(nodemailer.getTestMessageUrl(info));

    // only needed when using pooled connections
    transporter.close();
}

module.exports = {
    sendTestEmail,
};

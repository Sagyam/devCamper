const nodeMailer = require("nodemailer");

const sendEmail = (options) => {
	const transporter = nodeMailer.createTransport({
		host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT,
		auth: {
			user: process.env.SMTP_EMAIL,
			pass: process.env.SMTP_PASSWORD,
		},
	});
	let message = {
		from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
		to: options.to,
		subject: options.subject,
		text: options.message,
	};

	const info = transporter
		.sendMail(message)
		.then((info) => {
			console.log(`Message to ${options.to}`);
		})
		.catch((err) => {
			console.log(err);
		});

	return info;
};

module.exports = sendEmail;

import { transporter } from "./Email.confiq.js";
export const SendVerificationCode = async(email, verificationCode)=>{
   try{
    const response = await transporter.sendMail({
    from: '"Abhay-chatApplication" <imabhay098@gmail.com>',
    to: email,
    subject: "Verify you Email ",
    text: "verify your Email", 
    html: verificationCode,
  });
  console.log("Email send success:", response)
  }
  catch(error){
    console.log('email error')
  }
}
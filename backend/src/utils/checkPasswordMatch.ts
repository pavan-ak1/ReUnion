import bcrypt from 'bcrypt';

export const checkPassword = async(password:string, hashedPassword:string)=>{
    const isMatch  = await bcrypt.compare(password, hashedPassword);
    return isMatch;
}
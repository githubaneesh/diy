// flow
import CryptoJS from "crypto-js";
// var _data = [{id: 1}, {id: 2} , {id: 2}, {id: 2}, {id: 4}, {id: 5}, {id: 2}]
class CryptoHelper {

    static encrypt(data: any, nonce: string): void {
        const stringiFiedData = JSON.stringify(data);
        return this.encryptData(stringiFiedData, nonce);
    }

    static encryptData(data: any, nonce: string): void {
        var ciphertext = CryptoJS.AES.encrypt(data, nonce);
        const plainText = ciphertext.toString();
        return plainText;
    }

    static decrypt(plainText: string, nonce: string): any {
        const b = this.decryptData(plainText, nonce);
        if(!b.error) {
            const decryptedData = JSON.parse(b.decryptedData);
            return {
                error: false,
                decryptedData
            }
        }
        return b
    }

    static decryptData(plainText: string, nonce: string): any {
        try {
            const bytes  = CryptoJS.AES.decrypt(plainText, nonce);
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
            return {
                error: false,
                decryptedData
            }
        } catch (e) {
            console.log(e);
        }
        return {
            error: true,
            message: "Error in decryption"
        };
    }
}

export default CryptoHelper
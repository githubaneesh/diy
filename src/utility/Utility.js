import Settings from "../config/settings";
import moment from "moment";
export default class {
    /**
     * this method will convert array to id with value object
     */
    static convertToDisplayInDropDown(arr) {
        const list = [];
        arr.forEach(element => {
            list.push({value: element._id, label: element.name});
        });
        return list;
    }

    static convertQuestionTagsToDisplayInDropDown(arr) {
      const list = [];
      arr.forEach(element => {
          list.push({value: element._id, label: element.tag});
      });
      return list;
    }

    static convertStringArrayToDisplayInDropDown(arr){
      const list = [];
      arr.forEach(element => {
          list.push({value: element, label: element});
      });
      return list;
    }

    static getGenderValues(){
      const list = [{ value: 'male', label: 'Male' },{ value: 'female', label: 'Female' },{ value: 'other', label: 'Other' }];
      return list;
    }

    static getEthnicityValues(){
      const list = [{value: 'White', label:'White'}, 
                    {value:'African american', label: 'African American'}, 
                    {value:'Hispanic', label:'Hispanic'}, 
                    {value:'Asian', label:'Asian'}, 
                    {value:'Pacific islander', label:'Pacific Islander'},
                    {value:'Native american', label:'Native American'}, 
                    {value:'Southeast asian', label:'Southeast Asian'}, 
                    {value:'Middle eastern', label:'Middle Eastern'}, 
                    {value:'Other', label:'Other'}]
      return list.sort((a, b) => a["label"].localeCompare(b["label"]));
    }

    static getLuxuryQualifiedvalues(){
      const list = [{value:'Yes', label: 'Yes'},{value:'No', label: 'No'}];
      return list;
    }

    static convertTopicsToDisplayInDropDown(arr) {
        const list = [];
        arr.forEach(element => {
            list.push({value: element._id, label: element.title});
        });
        return list;
    }

    static convertQuestionsToDisplayInDropDown(arr) {
      const list = [];
      arr.forEach(element => {
          list.push({value: element._id, label: element.task});
      });
      return list;
  }

    static convertStudiesToDisplayInDropdownMenu(arr){
        const list = [];
        arr.forEach(element => {
            list.push({value: element._id, title: element.name, submenu:null});
        });
        return list;
    }

    static generateS3Url (signedUrl, filename) {
        const arr = signedUrl.split("/");
        const s3MediaBucketPath = `${arr[0]}//${arr[2]}`;
        return `${s3MediaBucketPath}/${filename}`;
    }

    static formatMe(number) {
        return number < 10 ? `0${number}` : number;
    }

    static async getQueryObj(search){
		if(!search){
			return null;
		}
		const decode = decodeURI(search)
		const query = decode.slice(1)
		var obj = {};
		var pairs = query.split('&');
		for(var i in pairs){
			var split = pairs[i].split('=');
			obj[decodeURIComponent(split[0])] = decodeURIComponent(split[1]);
		}
		return obj

	}
    static convertToDateString(str) {
        if(str){
            return str.split("T")[0];
        }
        else {
            return str;
        }
       
    }

    static isValidText(value) {
        const str = String(value).trim();
        if(!str || str=== 'undefined' || str === 'null' || str === '') {
            return false;
        }
        return true;
    }

    static isValidUrl (imageUrl) {
        return (this.isValidText(imageUrl) && !imageUrl.includes("blob.core.windows.net"));
    }

    static getExtension(filename) {
        var parts = filename.split('.');
        return parts[parts.length - 1];
    }

    static getBlobDataExtension(data){
      if(data) {
        let typeData = data.split(';')[0];
        return typeData.slice(typeData.indexOf(':')+1, typeData.indexOf('/'))
      }
    }
    
    static isImage(url) {
        if(!url) {
          return false;
        }
        let filename = url.substring(url.lastIndexOf('/') + 1)
        var ext = this.getExtension(filename);
        switch (ext.toLowerCase()) {
        case 'jpg':
        case 'gif':
        case 'bmp':
        case 'png':
            return true;
        }
        return false;
    }
    
    static isVideo(url) {
      if(url) {
        let filename = url.substring(url.lastIndexOf('/') + 1)
        var ext = this.getExtension(filename);
        switch (ext.toLowerCase()) {
        case 'm4v':
        case 'avi':
        case 'mpg':
        case 'mp4':
            return true;
        }
      }
        return false;
    }
    static topicTitleStyle (topic) {
        try {
          // console.log("styles", topic)
            if (topic.title_styles && topic.title_styles.length) {
              let title = "";
              const titleStyles = JSON.parse(topic.title_styles);
              for(let styleObj of titleStyles) {
                // console.log("style.size", styleObj);
                const style = styleObj.length ? styleObj[0] : styleObj;
                switch(style.size) {
                  case 25:
                    title += "<h1>" + style.text + "<h1/>"
                    break;
                  case 22:
                    title += "<h2>" + style.text + "<h2/>"
                    break;
                  case 19:
                    title += "<h3>" + style.text + "<h3/>"
                    break;
                  case 16:
                    title += "<h4>" + style.text + "<h4/>"
                    break;
                  case 14:
                    title += "<h5>" + style.text + "<h5/>"
                    break;
                  case 12:
                    title += "<h6>" + style.text + "<h6/>"
                    break;
                }
              }
              return title;
            } else {
              return topic.name;
            }
          } catch (e) {
            return "";
          }
    }
    static getYearsList() {
      const years = [];
      const min = 2002;
      const max = new Date().getFullYear();
  
      for (let i = max; min<=i; i--){
          years.push({value: i.toString(), label: i.toString()});
      }
      return years;
    }
    static getGenderList(checkedKey) {
      return [
        {value: "male", label: "Male", checked: checkedKey && checkedKey.toLowerCase() === "male"},
        {value: "female", label: "Female", checked: checkedKey && checkedKey.toLowerCase() === "female"},
        {value: "other", label: "Other", checked: checkedKey && checkedKey.toLowerCase() === "other"}
      ]      
    }
    static randomStr() {
      const arr =  "12345678910abcdefghijklmnopqrstuvwxyz!@$*+-?";
      let ans = ''; 
      for (var i = 8; i > 0; i--) { 
          ans +=  
            arr[Math.floor(Math.random() * arr.length)]; 
      } 
      return ans; 
  }
  static getAge(birthdate) {
     let age = moment().diff(birthdate, 'years');
     return age > 0 ? age : 0;   
  }
  static isValidEmail(email) {
    if(email.toString().indexOf(" ") !== -1) {
      return false;
    }
    var re = /\S+@\S+\.\S+/;
    // console.log(email, )
    return re.test(email);
  }

  static removeWhiteSpace(value) {
    return String(value).replace(/\s/gm,'');
  }

  static titleCase(str) {
    return str.toLowerCase().split(' ').map((word) => word.replace(word[0], word[0].toUpperCase())).join(' ');
  }

  static removeNonEnglishChars(fileName){
    fileName = fileName.replace(/[^a-zA-Z0-9]/g, "_");
    if (fileName.replace(/_/g, "").length === 0) {
      fileName = "Non_English";
    }
    return fileName;
  }

  static createUniqueFileName(file) {
    const arr = this.removeWhiteSpace(file).split(".");
    const fileName = this.removeNonEnglishChars(arr[0]);
    const timeStamp = new Date().getTime();
    return `${fileName}${timeStamp}.${arr[1]}`;
  }
}
import { Injectable } from '@angular/core';
import { Observable, Subscriber, BehaviorSubject, map } from 'rxjs';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import * as fs from 'file-saver';
// import { NotificationService } from '../notification/notification.service';
import { storage_url } from '../../../../environments/environment';
import { environment } from '../../../../environments/environment';


@Injectable()
export class FilesService {
  url = environment.SERVER_URL;
  viewer_url = environment.STORAGE_URL
  constructor(
    private http: HttpClient,
    // private notification_srv: NotificationService
  ) { }

  convertFilesToBase64(files:any) {
    return new Observable((obs) => {
      if (files && files.length) {
        let converted = [];
        for (let i = 0; i < files.length; i++) {
          if (files[i]) {
            let reader:any = new FileReader();

            reader.onload = () => {
              let file = new StandardFile();
              let extension;
              try {
                let length = files[i].name.split('.').length;
                extension = files[i].name.split('.') ? files[i].name.split('.')[length - 1] : '';
                if (extension) {
                  extension = extension.toLowerCase();
                }
              }
              catch (err) {
                extension = '';
              }

              file.setFileDetails(files[i].name, files[i].type, reader.result, extension, 1, 0, files[i].size, 1, null)
              converted.push(file);
              if (files.length == converted.length) {
                obs.next(converted);
              }
            }
            reader.readAsDataURL(files[i]);
          }
        };
      }
      else {
        obs.next([]);
      }
    })
  }

  // convertFilesToBase64(files) {
  //   return new Observable((obs) => {
  //     if (files && files.length) {
  //       let converted = [];
  //       for (let i = 0; i < files.length; i++) {
  //         if (files[i]) {
  //           let reader = new FileReader();

  //           reader.onload = () => {
  //             let file = new ICRFile();
  //             file.setFileDetails(files[i].name, files[i].type, files[i].size, files[i], reader.result, null)
  //             converted.push(file);
  //             if (files.length == converted.length) {
  //               obs.next(converted);
  //             }
  //           }
  //           reader.readAsDataURL(files[i]);
  //         }
  //       };
  //     }
  //     else {
  //       obs.next([]);
  //     }
  //   })
  // }

  docxFileToPdf(form_data:any) {
    return this.http.post(this.url + 'icrweb/home/viewPdfFromFile', form_data);
  }

  convertBase64ToFiles(files:any) {
    return new Observable((obs) => {
      if (files && files.length) {
        let converted = [];
        for (let i = 0; i < files.length; i++) {
          if (files[i]) {
            files[i].file = this.dataURLtoFile(files[i].base64, files[i].fileName);
          }
        };
        obs.next(files);
      }
      else {
        obs.next([]);
      }
    })
  }

  dataURLtoFile(dataurl:any, filename:any) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  getSignedURLs(attachments:any, header_type?:any, cdn_property?:any) {

    if (attachments && attachments.length) {
      if (!cdn_property) {
        cdn_property = 'cdnPath'
      }
      return new Observable(obs => {
        this.getURLRec(attachments, 0, [], obs, header_type, cdn_property);
      })
    }
    else {
      return attachments
    }
  }

  getURLRec(attachments:any, index:any, response:any, observable:any, header_type?:any, cdn_property?:any) {
    console.log(attachments)
    if (attachments && attachments.length && attachments[index] && attachments[index][cdn_property]) {
      this.getURL(attachments[index][cdn_property], header_type).subscribe((res:any) => {
        if (!response) {
          response = []
        }
        if (res && res['data']) {
          attachments[index]['url'] = res['data'].url;
          response.push(attachments[index]);
        }
        if (index < attachments.length - 1) {
          this.getURLRec(attachments, ++index, response, observable, header_type, cdn_property)
        }
        else {
          observable.next(response)
        }
      }, err => {
        console.log(err)
      })
    }
  }

  getURL(cdnPath:any, header_type?:any) {
    return this.http.get(this.url + 'icrweb/home/get_object_url', {
      headers: { header_type: header_type || '2' },
      params: {
        cdnPath: cdnPath
      }
    });
  }


  convertToBase64V2(cv: string) {
    // this.http.get(cv, { responseType: "blob" }).subscribe(blob => {
    //   const reader = new FileReader();
    //   const binaryString = reader.readAsDataURL(blob);
    //   reader.onload = (event: any) => {
    //     //Here you can do whatever you want with the base64 String
    //     console.log("File in Base64: ", event.target.result);
    //   };

    //   reader.onerror = (event: any) => {
    //     console.log("File could not be read: " + event.target.error.code);
    //   };
    // });

    let obs = new BehaviorSubject<any>(null);
    if (cv && cv != '') {

      let base64;

      var xhr = new XMLHttpRequest();
      xhr.open('GET', cv + '', true);
      xhr.responseType = 'blob';
      xhr.onload = function (e) {

        if (this.status == 200) {

          // Note: .response instead of .responseText

          console.log(this.response);

          obs.next(this.response)


          // var blob = new Blob([this.response], { type: this.response.type });

          // var blobToDataURL = function (blob) {

          //   var reader = new FileReader();

          //   reader.readAsDataURL(blob);

          //   reader.onloadend = function () {
          //     base64 = reader.result;
          //     base64 = base64.replace('application/octet-stream', 'application/pdf');

          //     obs.next(base64)
          //   }

          // };

          // blobToDataURL(blob);

        }

      };



      xhr.send();

    }
    return obs.asObservable();
  }

  saveFileFromURL(url:string, fileName:any) {
    this.getURL(url).subscribe((res:any) => {
      if (res && res['data']) {
        this.saveFromURL(res['data'].url, fileName).subscribe(file => {
        })
      }

    }, err => {
      let link = document.createElement("a");
      link.download = fileName;
      // console.log(link.download)
      link.setAttribute('download', fileName);
      link.href = storage_url + url;
      document.body.appendChild(link);
      link.click();
      link.remove();
    })
  }

  saveAttachments(files:any, multiple:any) {
    if (multiple && files && files.length) {
      return new Observable(obs => {
        this.recursiveSave(files, 0, [], obs);
      })
    }
    else if (files && files.length == undefined) {
      return this.saveAttachment(files)
    }
    else {
      return new Observable(obs => {
        obs.next(null);
      });
    }
  }

  convertToBase64(cv: string) {
    // this.http.get(cv, { responseType: "blob" }).subscribe(blob => {
    //   const reader = new FileReader();
    //   const binaryString = reader.readAsDataURL(blob);
    //   reader.onload = (event: any) => {
    //     //Here you can do whatever you want with the base64 String
    //     console.log("File in Base64: ", event.target.result);
    //   };

    //   reader.onerror = (event: any) => {
    //     console.log("File could not be read: " + event.target.error.code);
    //   };
    // });

    let obs = new BehaviorSubject<any>(null);
    if (cv && cv != '') {

      let base64;

      var xhr = new XMLHttpRequest();
      xhr.open('GET', cv + '', true);
      xhr.responseType = 'blob';
      xhr.onload = function (e) {

        if (this.status == 200) {

          // Note: .response instead of .responseText

          console.log(this.response);



          var blob = new Blob([this.response], { type: this.response.type });

          var blobToDataURL = function (blob:any) {

            var reader = new FileReader();

            reader.readAsDataURL(blob);

            reader.onloadend = function () {
              base64 = reader.result;
              base64 = (base64 as string)?.replace('application/octet-stream', 'application/pdf');

              obs.next(base64)
            }

          };

          blobToDataURL(blob);

        }

      };



      xhr.send();

    }
    return obs.asObservable();
  }
  saveFromURL(cv: string, name:any) {
    // this.http.get(cv, { responseType: "blob" }).subscribe(blob => {
    //   const reader = new FileReader();
    //   const binaryString = reader.readAsDataURL(blob);
    //   reader.onload = (event: any) => {
    //     //Here you can do whatever you want with the base64 String
    //     console.log("File in Base64: ", event.target.result);
    //   };

    //   reader.onerror = (event: any) => {
    //     console.log("File could not be read: " + event.target.error.code);
    //   };
    // });

    let obs = new BehaviorSubject<any>(null);
    if (cv && cv != '') {

      let base64;

      var xhr = new XMLHttpRequest();
      xhr.open('GET', cv + '', true);
      xhr.responseType = 'blob';
      xhr.onload = function (e) {

        if (this.status == 200) {

          // Note: .response instead of .responseText

          console.log(this.response);



          var blob = new Blob([this.response], { type: this.response.type });
          fs.saveAs(blob, name);
        }

      };



      xhr.send();

    }
    return obs.asObservable();
  }

  recursiveSave(files:any, index:any, response:any, observable:any):any {
    if (files[index] && files[index].content && !files[index].cdnPath) {
      this.saveAttachment(files[index]).subscribe((res:any) => {
        // this.notification_srv.success(('Uploaded attachments ' + (index + 1) + '/' + files.length), 'Close', 5000);
        if (!response) {
          response = [];
        }
        if (res && res['data']) {
          response.push(res['data']);
        }
        if (index < files.length - 1) {
          return this.recursiveSave(files, ++index, response, observable);
        }
        else {
          observable.next(response);
        }
      }, err => {

      })
    }
    else {
      response.push(files[index]);
      if (index < files.length - 1) {
        return this.recursiveSave(files, ++index, response, observable);
      }
      else {
        observable.next(response);
      }
    }
  }

  getBase64String(req:any) {
    return this.http.post(this.viewer_url + 'icrweb/home/docviewer', req)
  }



  saveAttachment(file:any) {
    let f = this.makeFormDataFile(file);
    let form_data = new FormData();
    form_data.append('attachment', f, f.name)
    return this.http.post(this.url + 'service_attachment', form_data, {
      headers: { header_type: '2' }
    })
    // return this.http.post("", fd)
  }
  uploadAttachment(form_data:any, header_type?:any) {
    return this.http.post(this.url + 'service_attachment', form_data, {
      headers: { header_type: header_type || '2' }
    });
  }
  getDocxBase64(filepath:any, header_type?:any) {
    https://www.icanrefer.com/api_v1/icrweb/home/viewDocNew?lngId=1
    return this.http.post(this.viewer_url + 'icrweb/home/viewDocNew', {
      cdnPath: filepath
    },
      {
        headers: {
          header_type: header_type ? header_type.toString() : '1'
        }
      })
  }
  makeFormDataFile(file:any) {
    try {
      if (file) {
        let base64 = (file.content);
        let file_title = (file.fileName);
        let mime_type = (file.mimeType);
        function dataURLtoFile(dataurl:any, filename:any) {

          var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);

          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }

          return new File([u8arr], filename, { type: mime });
        }
        let formatted_file = dataURLtoFile(base64, file_title);
        return formatted_file;
      }
    }
    catch (err) {
      return file
      console.log(err)
    }

  }

  resumeParser(request:any, parsertype?:any, header_type?:any) {
    return this.http.post(this.viewer_url + 'icrweb/home/resumeParser', request, {
      headers: {
        header_type: header_type || '1',
        parsertype: parsertype || '0'
      }
    });
  }

  documentDeclaration(obj:any) {
    return this.http.post(this.url + 'icrweb/home/save_and_generate_offer_onb_agreed_document', obj)
  }

  fileSizeUnit: number = 1024;


  getFileSize(fileSize: number): number {
    if (fileSize > 0) {
      if (fileSize < this.fileSizeUnit * this.fileSizeUnit) {
        fileSize = parseFloat((fileSize / this.fileSizeUnit).toFixed(2));
      } else if (
        fileSize <
        this.fileSizeUnit * this.fileSizeUnit * this.fileSizeUnit
      ) {
        fileSize = parseFloat(
          (fileSize / this.fileSizeUnit / this.fileSizeUnit).toFixed(2)
        );
      }
    }

    return fileSize;
  }

  getFileSizeUnit(fileSize: number) {
    let fileSizeInWords = 'bytes';

    if (fileSize > 0) {
      if (fileSize < this.fileSizeUnit) {
        fileSizeInWords = 'bytes';
      } else if (fileSize < this.fileSizeUnit * this.fileSizeUnit) {
        fileSizeInWords = 'KB';
      } else if (
        fileSize <
        this.fileSizeUnit * this.fileSizeUnit * this.fileSizeUnit
      ) {
        fileSizeInWords = 'MB';
      }
    }

    return fileSizeInWords;
  }

  uploadMedia(formData: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http
      .post(`http://yourapiurl`, formData, {
        headers,
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((event:any) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              const progress = Math.round((100 * event.loaded) / event.total);
              return { status: 'progress', message: progress };

            case HttpEventType.Response:
              return event.body;
            default:
              return `Unhandled event: ${event.type}`;
          }
        })
      );
  }

}

export class StandardFile {
  fileName: string | null;
  mime_type: string |null;
  content: string | null;
  extension: string | null;
  status: number | null;
  attachment_id: number | null;
  size: string | null;
  cdnPath: string | null;
  content_type: number | null;
  setFileDetails(fileName:string, mime_type:string, content:string, extension:string, status:number, attachment_id:number, size:string, content_type:number, cdnPath:any) {
    this.fileName = fileName;
    this.mime_type = mime_type;
    this.content = content;
    this.extension = extension;
    this.status = status;
    this.attachment_id = attachment_id;
    this.size = size;
    this.content_type = content_type || 1;
    this.cdnPath = cdnPath;
  }

  constructor(obj = {
    fileName: null,
    mime_type: null,
    content: null,
    status: null,
    attachment_id: null,
    extension: null,
    size: null,
    content_type: null,
    cdnPath: null,
  }) {
    this.fileName = obj.fileName;
    this.mime_type = obj.mime_type;
    this.content = obj.content;
    this.extension = obj.extension;
    this.status = obj.status;
    this.attachment_id = obj.attachment_id;
    this.size = obj.size;
    this.content_type = obj.content_type || 1;
    this.cdnPath = obj.cdnPath;
  }
}
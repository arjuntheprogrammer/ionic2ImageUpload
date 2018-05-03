import { Component } from '@angular/core';
import { NavController, ActionSheetController, ToastController, Platform, LoadingController, Loading } from 'ionic-angular';

import { File } from '@ionic-native/file';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import { Camera } from '@ionic-native/camera';

declare var cordova: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  lastImage: string = null;
  loading: Loading;

  constructor(public navCtrl: NavController, private camera: Camera, private transfer: Transfer, 
    private file: File, private filePath: FilePath, public actionSheetCtrl: ActionSheetController, 
    public toastCtrl: ToastController, public platform: Platform, public loadingCtrl: LoadingController) { }

  public presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Load from Library',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Use Camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }
  public takePicture(sourceType) {
    // Create options for the Camera Dialog
    var options = {
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    // Get the data of an image
    this.camera.getPicture(options).then((imagePath) => {
      // Special handling for Android library
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        console.log("here inside");
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
            console.log("filePath", filePath);

            let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
          });
      } else {
        var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
      }
    }, (err) => {
      this.presentToast('Error while selecting image.');
    });
  }


  private createFileName() {
    var d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
    return newFileName;
  }

  // Copy the image to a local folder
  private copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
      this.lastImage = newFileName;
    }, error => {
      this.presentToast('Error while storing file.');
    });
  }

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  // Always get the accurate path to your apps folder
  public pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      return cordova.file.dataDirectory + img;
    }
  }


  public uploadImage() {
    // Destination URL
    var url = "http://192.168.0.122:9999/profiles/imageUpload/";

    // File for Upload
    var targetPath = this.pathForImage(this.lastImage);

    // File name only
    var filename = this.lastImage;

    var options = {
      fileKey: "file",
      fileName: filename,
      chunkedMode: false,
      mimeType: "multipart/form-data",
      params: { 'fileName': filename, 'textData': "sdafsdf" }
    };

    const fileTransfer: TransferObject = this.transfer.create();

    this.loading = this.loadingCtrl.create({
      content: 'Uploading...',
    });
    this.loading.present();

    // Use the FileTransfer to upload the image
    fileTransfer.upload(targetPath, url, options).then(data => {
      this.loading.dismissAll()
      this.presentToast('Image succesful uploaded.');
    }, err => {
      this.loading.dismissAll()
      this.presentToast('Error while uploading file.');
    });
  }
}





//////////////////////Image Upload Post Request Extra/////////////////////////////


//   public base64Image: string;
// options: any;

//   public takePicture() {
//   this.options = {
//     quality: 100,
//     sourceType: this.camera.PictureSourceType.CAMERA,
//     saveToPhotoAlbum: true,
//     correctOrientation: true,
//     destinationType: this.camera.DestinationType.DATA_URL,
//     mediaType: this.camera.MediaType.VIDEO
//   }
//   this.camera.getPicture(this.options)
//     .then((imageData) => {
//       this.base64Image = "data:image/jpeg;base64," + imageData;
//       this.uploadImage();
//     }).then((path) => {

//     })
// }


// pickPicture() {

//   this.camera.getPicture({
//     destinationType: this.camera.DestinationType.DATA_URL,
//     sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
//     mediaType: this.camera.MediaType.PICTURE
//   }).then((imageData) => {
//     // imageData is a base64 encoded string
//     this.base64Image = "data:image/jpeg;base64," + imageData;
//     this.uploadImage();
//   }, (err) => {
//     console.log(err);
//   });
// }

// uploadImage(){
//   // var url = "http://192.168.0.122:9999/profiles/imageUpload/";
//   // let seq = this.http.post
//   // ("http://localhost:8000/profiles/imageUpload/", 
//   // { "img": this.base64Image, "extra": "extraDataisHere" });


//   this.user.uploadPhoto({ "img": this.base64Image, "extra": "extraDataisHere" })
//     .subscribe((resp) => {
//       var obj1 = JSON.parse(resp['_body']);
//       console.log("driver obj:", obj1);
//     }, (err) => {

//       let toast = this.toastCtrl.create({
//         message: this.signupErrorString,
//         duration: 3000,
//         position: 'top'
//       });
//       toast.present();
//     });


// }



// uploadPhoto(data){
//   let seq = this.api.post('profiles/imageUpload/', data).share();

//   seq.subscribe((res: any) => {
//     // If the API returned a successful response, mark the user as logged in
//     // console.log("result", res);
//     // if (res.status == 'success') {
//     //   this._loggedIn(res);
//     // }

//   }, err => {
//     console.error('ERROR', err);
//   });

//   return seq;
// }




// <ion-card - content >
// Hello World, this is my camera app

//   < button(click)="takePicture()" > Take a Picture < /button>

// Latest Picture:
// <img[src]="base64Image" * ngIf="base64Image" />
// </ion-card-content>



// in django settings

// # overriding max upload size
// DATA_UPLOAD_MAX_MEMORY_SIZE = 10242880



// @csrf_exempt
// def imageUpload(request):

// import base64
//   from django.core.files.base import ContentFile
//     data = json.loads(request.body)
// format, imgstr = data['img'].split(';base64,')
// ext = format.split('/')[-1]
// dataIm = ContentFile(base64.b64decode(imgstr), name = 'temp.' + ext)
// profile = Profile.objects.get(pk = 2)
// profile.profile_pic = dataIm
// profile.save()

// return JsonResponse({ "uploaded_file_url": "outside" }, status = 200, safe = False)
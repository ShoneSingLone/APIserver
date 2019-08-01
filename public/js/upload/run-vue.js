import {
    compress
} from "./compress2.js";

let {
    VueServer,
    $
} = window, {
    imgViewer
} = VueServer;

let uploadOptions = {
    data() {
        return {
            dialogImageUrl: "",
            dialogVisible: false,
            fileList: []
        };
    },
    methods: {
        upload(event) {
            var fileList = this.fileList;
            Promise.all(
                fileList.map(function (file) {
                    return compress(file).then(function (blob) {
                        var a = document.createElement("a");
                        a.textContent = "Download";
                        document.body.appendChild(a);
                        a.style.display = "block";
                        a.download = file.name;
                        a.href = window.URL.createObjectURL(blob);
                        return Promise.resolve({
                            blob: blob,
                            name: file.name
                        });
                    });
                })
            ).then(function (blobs) {
                console.log(blobs);
                var formData = new FormData();
                blobs.forEach(function (blobObj) {
                    return formData.append("file", blobObj.blob, blobObj.name);
                });
                $.ajax({
                    type: "post",
                    url: "/profile",
                    data: formData,
                    contentType: false,
                    //这里不要落下
                    processData: false,
                    dataType: "json",
                    success: function success(data) {
                        debugger;
                    },
                    error: function error(_error) {
                        debugger;
                    }
                });
            });
        },
        handleChange(file, fileList) {
            this.fileList = fileList;
            console.log("handleChange", file, fileList);
        },
        handleHttpRequest(file, fileList) {
            console.log("handleHttpRequest", file, fileList);
        },
        handleRemove(file, fileList) {
            console.log(file, fileList);
        },
        handlePictureCardPreview: file => imgViewer.setImgs(file.url).show()
    }
};

export let appOptions = {
    el: "#app",
    mixins: [uploadOptions]
};
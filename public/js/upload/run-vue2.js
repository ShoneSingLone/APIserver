import compressionImg from "./compress.js";

let {
    VueServer
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
            console.log("upload event", event);
            Promise.all(this.fileList.map(file => {
                    debugger;
                    return compressionImg(file)
                        .then((blob) => {
                            console.log(blob);
                            var a = document.createElement("a");
                            a.textContent = "Download";
                            document.body.appendChild(a);
                            a.style.display = "block";
                            a.download = file.name;
                            a.href = window.URL.createObjectURL(blob);
                        });
                }))
                .then(() => {
                    this.$refs.uploadEle.submit();
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
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
            this.$refs.uploadEle.submit();
        },
        handleChange(file, fileList) {
            console.log("handleChange", file, fileList);
        },
        handleHttpRequest(file, fileList) {
            compressionImg(file)
                .then((res) => {
                    debugger;
                    console.log(res);
                });
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
module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "es6": true
    },
    globals: {
        "requirejs": true,
        "define": true
    },
    extends: [
        'eslint:recommended',
    ],
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module",
        "allowImportExportEverywhere": true
    },
    "rules": {
        "quotes": [
            "error",
            "double",
            {
                "allowTemplateLiterals": true
            }
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-console": ["error", {
            allow: ["warn", "error"]
        }]
    }
};
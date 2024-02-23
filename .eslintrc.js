modules.exports = {
    root: true,
    ignorePatterns: [
        "**/*"
    ],
    overrides: [
        {
            "files": [
                "*.ts",
                "*.tsx",
                "*.js",
                "*.jsx"
            ],
            "rules": {}
        },
        {
            "files": [
                "*.spec.ts",
                "*.spec.tsx",
                "*.spec.js",
                "*.spec.jsx"
            ],
            "env": {
                "jest": true
            },
            "rules": {}
        },
        {
            "files": "*.json",
            "parser": "jsonc-eslint-parser",
            "rules": {}
        }
    ]
}
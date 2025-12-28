function executeCode(code, lang) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "https://emkc.org/api/v2/piston/execute",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                language: lang.language,
                version: lang.version,
                files: [{ content: code }]
            }),
            success: resolve,
            error: reject
        });
    });
}

const LANGUAGE_CONFIG = {
    c: { language: "c", version: "10.2.0" },
    cpp: { language: "cpp", version: "10.2.0" },
    java: { language: "java", version: "15.0.2" },
    kotlin: { language: "kotlin", version: "1.8.0" },
    python: { language: "python", version: "3.11.0" },
    javascript: { language: "javascript", version: "18.15.0" },
    typescript: { language: "typescript", version: "5.0.3" },
    php: { language: "php", version: "8.2.3" },
    ruby: { language: "ruby", version: "3.2.2" },
    rust: { language: "rust", version: "1.68.2" },
    go: { language: "go", version: "1.20.2" },
    csharp: { language: "csharp", version: "6.12.0" },
    swift: { language: "swift", version: "5.8.1" },
    bash: { language: "bash", version: "5.2.0" }
};

export async function countSetBits1(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;

    if (currentlang == "c") {
        fullcode = `#include<stdio.h>

${userCode}

int main(){
    printf("%d", countSetBits(${testCase.n}));
    return 0;
}`;
    }
    else if (currentlang == "cpp") {
        fullcode = `#include<iostream>
using namespace std;

${userCode}

int main(){
    cout << countSetBits(${testCase.n});
    return 0;
}`;
    }
    else if (currentlang == "java") {
        fullcode = `
${userCode}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.print(sol.countSetBits(${testCase.n}));
    }
}`;
    }
    else if (currentlang == "javascript") {
        fullcode = `
${userCode}

console.log(countSetBits(${testCase.n}));
`;
    }

    const response = await executeCode(fullcode, lang);

    // Error handling if compilation fails
    if (response.run.code !== 0) {
        return {
            passed: false,
            output: response.run.stderr || response.run.output
        };
    }

    // Parse output and compare
    return {
        passed: parseInt(response.run.output.trim()) === testCase.expected,
        output: response.run.output
    };
}
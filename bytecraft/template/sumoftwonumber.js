function executeCode(code,lang) {
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




export async function sumTwoNumbersTemplate(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;
    if (currentlang == "c") {
        fullcode = `#include <stdio.h>

${userCode}

int main() {
    int result = sum(${testCase.a}, ${testCase.b});
    printf("%d", result);
    return 0;
}`;
    }
    else
    if(currentlang=="cpp"){
       fullcode = `#include <iostream>
       using namespace std;
${userCode}

int main() {
    int result = sum(${testCase.a}, ${testCase.b});
    cout<<result;
    return 0;
}`; 
    }
    else
    if(currentlang=="javascript"){
        fullcode = `
        ${userCode}
        const a = ${testCase.a};
const b = ${testCase.b};

const result = sum(a, b);
console.log(result);`;
    }
    else
    if(currentlang=="java"){
        fullcode = 
        `class Main {

    ${userCode}

    public static void main(String[] args) {
        int a = ${testCase.a};
        int b = ${testCase.b};

        int result = sum(a, b);
        System.out.println(result);
    }
}`;

    }else
        if(currentlang=="python"){
            fullcode = 
`${userCode}

result = sum(${testCase.a}, ${testCase.b})
print(result)
`;
        }
    const response = await executeCode(fullcode,lang);
    return {
        passed: parseInt(response.run.output) === testCase.expected,
        output: response.run.output
    };
} 
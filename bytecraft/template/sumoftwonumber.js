function executeCode(code, lang) {
    return new Promise((resolve, reject) => {

        $.ajax({
            url: "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                source_code: code,
                language_id: lang.language_id,
                stdin: "",
                cpu_time_limit: 5,
                memory_limit: 128000
            }),
            success: function (response) {

                // Convert Judge0 response → Piston-like structure
                resolve({
                    run: {
                        stdout: response.stdout || "",
                        stderr: response.stderr || response.compile_output || "",
                        output:
                            (response.stdout || "") +
                            (response.stderr || "") +
                            (response.compile_output || ""),
                        code: response.status?.id || 0,
                        signal: response.status?.description || null
                    }
                });

            },
            error: function (xhr) {
                reject({
                    run: {
                        stdout: "",
                        stderr: xhr.responseText || "Execution failed",
                        output: xhr.responseText || "Execution failed",
                        code: -1,
                        signal: null
                    }
                });
            }
        });

    });
}


const LANGUAGE_CONFIG = {
    c: { language_id: 50 },
    cpp: { language_id: 54 },
    java: { language_id: 62 },
    kotlin: { language_id: 78 },
    python: { language_id: 71 },
    javascript: { language_id: 63 },
    typescript: { language_id: 74 },
    php: { language_id: 68 },
    ruby: { language_id: 72 },
    rust: { language_id: 73 },
    go: { language_id: 60 },
    csharp: { language_id: 51 },
    swift: { language_id: 83 },
    bash: { language_id: 46 }
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

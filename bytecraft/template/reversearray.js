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

export async function reverseArrayTemplate(userCode, testCase,currentlang) {

    const data = testCase.arr.join(", ");
    const size = testCase.n;

    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;
    if (currentlang == "c") {
        fullcode = `#include <stdio.h>

${userCode}

int main() {
    int arr[] = {${data}};
    int n = ${size};

    int *ptr = arr;
    reverce(ptr, n);

    for(int i = 0; i < n; i++) {
        printf("%d", arr[i]);
        if(i < n - 1) printf(" ");
    }

    return 0;
}`;
    }
    else
    if(currentlang=="cpp"){
        fullcode = `#include <iostream>
using namespace std;

${userCode}

int main() {
    int arr[] = {${data}};
    int n = ${size};

    int *ptr = arr;
    reverce(ptr, n);

    for(int i = 0; i < n; i++) {
        cout << arr[i];
        if(i < n - 1) cout << " ";
    }

    return 0;
}`;
    }
    else
    if(currentlang=="java"){
        fullcode = `class Main {

    ${userCode}

    public static void main(String[] args) {
        int[] arr = {${data}};
        int n = ${size};

        reverce(arr, n);

        for(int i = 0; i < n; i++) {
            System.out.print(arr[i]);
            if(i < n - 1) System.out.print(" ");
        }
    }
}`;
    }
    else
    if(currentlang=="javascript"){
        fullcode = `
        ${userCode}

let arr = [${data}];
let n = ${size};

reverce(arr, n);

for (let i = 0; i < n; i++) {
    process.stdout.write(arr[i].toString());
    if (i < n - 1) process.stdout.write(" ");
}
`
    }
    else
    if(currentlang=="python"){
        fullcode = `
        ${userCode}

arr = [${data}]
n = ${size}

reverce(arr, n)

for i in range(n):
    print(arr[i], end="")
    if i < n - 1:
        print(" ", end="")
`
    }

    

    const response = await executeCode(fullcode,lang);

    // 🔴 Handle compilation/runtime error
    if (response.run.stderr && response.run.stderr.trim() !== "") {
        return {
            passed: false,
            output: response.run.stderr
        };
    }

    // 🟢 Convert output → array
    const outputArray = response.run.output
        .trim()
        .split(" ")
        .map(Number);

    // 🟢 Expected array
    const expectedArray = testCase.expected;

    // 🟢 Compare
    let passed = outputArray.length === expectedArray.length;

    if (passed) {
        for (let i = 0; i < expectedArray.length; i++) {
            if (outputArray[i] !== expectedArray[i]) {
                passed = false;
                break;
            }
        }
    }

    return {
        passed,
        output: outputArray
    };
}

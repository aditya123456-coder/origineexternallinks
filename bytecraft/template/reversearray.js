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
// sumOfElementsInArray.js

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
    javascript: { language: "javascript", version: "18.15.0" },
    java: { language: "java", version: "15.0.2" }
};

export async function sumofelementsusingarrayandpointer(userCode, testCase, currentlang) {

    const lang = LANGUAGE_CONFIG[currentlang];
    const data = testCase.arr.join(", ");
    const n = testCase.n;

    let fullcode = null;

    if (currentlang === "c") {
        fullcode = `#include <stdio.h>

${userCode}

int main() {
    int arr[] = {${data}};
    int n = ${n};
    int res = 0;

    sum(arr, n, &res);
    printf("%d", res);

    return 0;
}`;
    }

    else if (currentlang === "cpp") {
        fullcode = `#include <iostream>
using namespace std;

${userCode}

int main() {
    int arr[] = {${data}};
    int n = ${n};
    int res = 0;

    sum(arr, n, &res);
    cout << res;

    return 0;
}`;
    }

    else if (currentlang === "javascript") {
        fullcode = `
${userCode}

const arr = [${data}];
const n = ${n};
let res = { value: 0 };

sum(arr, n, res);
console.log(res.value);
`;
    }

    else if (currentlang === "java") {
        fullcode = `class Main {

${userCode}

public static void main(String[] args) {
    int[] arr = {${data}};
    int n = ${n};
    int[] res = new int[1];

    sum(arr, n, res);
    System.out.println(res[0]);
}
}`;
    }

    const response = await executeCode(fullcode, lang);

    return {
        passed: parseInt(response.run.output.trim()) === testCase.expected,
        output: response.run.output
    };
}

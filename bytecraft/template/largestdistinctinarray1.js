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
    javascript: { language: "javascript", version: "18.15.0" },
    python: { language: "python", version: "3.11.0" }
};

export async function largestdistinctinarray1(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;

    // ✅ C
    if (currentlang === "c") {
        fullcode = `#include <stdio.h>

${userCode}

int main(){
    int arr[] = {${testCase.arr.join(",")}};
    int n = ${testCase.arr.length};
    printf("%d", largestDistinct(arr, n));
    return 0;
}`;
    }

    // ✅ C++
    if (currentlang === "cpp") {
        fullcode = `#include <bits/stdc++.h>
using namespace std;

${userCode}

int main(){
    int arr[] = {${testCase.arr.join(",")}};
    int n = ${testCase.arr.length};
    cout << largestDistinct(arr, n);
    return 0;
}`;
    }

    // ✅ Java
    if (currentlang === "java") {
        fullcode = `class Main {
${userCode}

    public static void main(String[] args){
        int[] arr = {${testCase.arr.join(",")}};
        System.out.print(largestDistinct(arr, arr.length));
    }
}`;
    }

    // ✅ JavaScript
    if (currentlang === "javascript") {
        fullcode = `
${userCode}

const arr = [${testCase.arr.join(",")}];
console.log(largestDistinct(arr, arr.length));
`;
    }

    // ✅ Python
    if (currentlang === "python") {
        fullcode = `
${userCode}

arr = [${testCase.arr.join(",")}]
print(largestDistinct(arr, len(arr)))
`;
    }

    const response = await executeCode(fullcode, lang);

    return {
        passed: parseInt(response.run.output.trim()) === testCase.expected,
        output: response.run.output
    };
}

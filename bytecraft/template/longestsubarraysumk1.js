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

export async function longestsubarraysumk1(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;

    // ✅ C
    if (currentlang === "c") {
        fullcode = `#include <stdio.h>

${userCode}

int main(){
    int arr[] = {${testCase.arr.join(",")}};
    int n = ${testCase.arr.length};
    int k = ${testCase.k};
    printf("%d", longestSubarray(arr, n, k));
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
    int k = ${testCase.k};
    cout << longestSubarray(arr, n, k);
    return 0;
}`;
    }

    // ✅ Java
    if (currentlang === "java") {
        fullcode = `class Main {
${userCode}

    public static void main(String[] args){
        int[] arr = {${testCase.arr.join(",")}};
        System.out.print(longestSubarray(arr, arr.length, ${testCase.k}));
    }
}`;
    }

    // ✅ JavaScript
    if (currentlang === "javascript") {
        fullcode = `
${userCode}

const arr = [${testCase.arr.join(",")}];
console.log(longestSubarray(arr, arr.length, ${testCase.k}));
`;
    }

    const response = await executeCode(fullcode, lang);

    return {
        passed: parseInt(response.run.output.trim()) === testCase.expected,
        output: response.run.output
    };
}

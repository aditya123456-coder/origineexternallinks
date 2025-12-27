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
    bash: { language: "bash", version: "5.2.0" }
};

export async function countvowels1(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;

    // ✅ C
    if (currentlang === "c") {
        fullcode = `#include <stdio.h>

${userCode}

int main(){
    char str[] = "${testCase.str}";
    printf("%d", countVowels(str));
    return 0;
}`;
    }

    // ✅ C++
    if (currentlang === "cpp") {
        fullcode = `#include <bits/stdc++.h>
using namespace std;

${userCode}

int main(){
    char str[] = "${testCase.str}";
    cout << countVowels(str);
    return 0;
}`;
    }

    // ✅ Java
    if (currentlang === "java") {
        fullcode = `class Main {
${userCode}

    public static void main(String[] args){
        String str = "${testCase.str}";
        System.out.print(countVowels(str));
    }
}`;
    }

    // ✅ JavaScript
    if (currentlang === "javascript") {
        fullcode = `
${userCode}

const str = "${testCase.str}";
console.log(countVowels(str));
`;
    }

    // ✅ Bash
    if (currentlang === "bash") {
        fullcode = `
${userCode}

countVowels "${testCase.str}"
`;
    }

    const response = await executeCode(fullcode, lang);

    return {
        passed: parseInt(response.run.output.trim()) === testCase.expected,
        output: response.run.output
    };
}

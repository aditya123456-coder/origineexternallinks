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
    bash: { language: "bash", version: "5.2.0" },
    typescript: { language: "typescript", version: "5.0.3" }
};

export async function longestpalindromesubstring1(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;

    // ✅ C (malloc + pointer return)
    if (currentlang === "c") {
        fullcode = `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

${userCode}

int main(){
    char str[] = "${testCase.str}";
    char *res = longestPalindrome(str, ${testCase.str.length});
    printf("%s", res);
    return 0;
}`;
    }

    // ✅ C++
    if (currentlang === "cpp") {
        fullcode = `#include <bits/stdc++.h>
using namespace std;

${userCode}

int main(){
    string str = "${testCase.str}";
    cout << longestPalindrome(str.c_str(), str.length());
    return 0;
}`;
    }

    // ✅ Java
    if (currentlang === "java") {
        fullcode = `class Main {
${userCode}

    public static void main(String[] args){
        String str = "${testCase.str}";
        System.out.print(longestPalindrome(str, str.length()));
    }
}`;
    }

    // ✅ JavaScript
    if (currentlang === "javascript") {
        fullcode = `
${userCode}

const str = "${testCase.str}";
console.log(longestPalindrome(str, str.length));
`;
    }

    // ✅ Bash
    if (currentlang === "bash") {
        fullcode = `
${userCode}

longestPalindrome "${testCase.str}"
`;
    }

    // ✅ TypeScript
    if (currentlang === "typescript") {
        fullcode = `
${userCode}

const str: string = "${testCase.str}";
console.log(longestPalindrome(str, str.length));
`;
    }

    const response = await executeCode(fullcode, lang);

    return {
        passed: response.run.output.trim() === testCase.expected,
        output: response.run.output
    };
}

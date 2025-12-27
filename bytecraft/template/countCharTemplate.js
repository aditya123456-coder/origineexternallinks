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
    javascript: { language: "javascript", version: "18.15.0" },
    java: { language: "java", version: "15.0.2" }
};

export async function countCharTemplate(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;

    if (currentlang === "c") {
        fullcode = `#include <stdio.h>

${userCode}

int main() {
    char str[] = "${testCase.str}";
    char ch = '${testCase.ch}';

    int result = countChar(str, ch);
    printf("%d", result);
    return 0;
}`;
    }
    else if (currentlang === "cpp") {
        fullcode = `#include <iostream>
using namespace std;

${userCode}

int main() {
    string str = "${testCase.str}";
    char ch = '${testCase.ch}';

    int result = countChar(str, ch);
    cout << result;
    return 0;
}`;
    }
    else if (currentlang === "javascript") {
        fullcode = `
${userCode}

const str = "${testCase.str}";
const ch = '${testCase.ch}';

const result = countChar(str, ch);
console.log(result);
`;
    }
    else if (currentlang === "java") {
        fullcode = `
class Main {

    ${userCode}

    public static void main(String[] args) {
        String str = "${testCase.str}";
        char ch = '${testCase.ch}';

        int result = countChar(str, ch);
        System.out.println(result);
    }
}
`;
    }

    const response = await executeCode(fullcode, lang);

    return {
        passed: parseInt(response.run.output) === testCase.expected,
        output: response.run.output
    };
}

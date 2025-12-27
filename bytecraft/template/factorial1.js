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
    c: { language: "c", version: "10.2.0" }
};

export async function factorial1(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;

    if (currentlang === "c") {
        fullcode = `#include<stdio.h>

${userCode}

int main(){
    printf("%d", factorial(${testCase.a}));
    return 0;
}`;
    }

    const response = await executeCode(fullcode, lang);

    return {
        passed: parseInt(response.run.output) === testCase.expected,
        output: response.run.output
    };
}

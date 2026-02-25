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

export async function pairSuminarrayusingk1(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;

    // Convert array to string format for C/Java/JS injection
    // Example: [1, 2, 3] -> "1, 2, 3"
    const arrString = testCase.arr.join(", "); 

    if (currentlang == "c") {
        fullcode = `#include<stdio.h>
#include<stdbool.h>

${userCode}

int main(){
    int arr[] = {${arrString}};
    int size = ${testCase.size};
    int k = ${testCase.k};
    printf("%d", checkPairSum(arr, size, k));
    return 0;
}`;
    } 
    else if (currentlang == "cpp") {
        fullcode = `#include<iostream>
#include<vector>
#include<algorithm>
using namespace std;

${userCode}

int main(){
    vector<int> arr = {${arrString}};
    int k = ${testCase.k};
    cout << checkPairSum(arr, k);
    return 0;
}`;
    }
    else if (currentlang == "java") {
        fullcode = `import java.util.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] arr = {${arrString}};
        int k = ${testCase.k};
        System.out.print(sol.checkPairSum(arr, k));
    }
}`;
    }
    else if (currentlang == "javascript") {
        fullcode = `
${userCode}

const arr = [${arrString}];
const k = ${testCase.k};
console.log(checkPairSum(arr, k));
`;
    }

    const response = await executeCode(fullcode, lang);
    
    // Check for compilation/runtime errors before parsing output
    if (response.run.code !== 0) {
        return {
            passed: false,
            output: response.run.stderr || response.run.output // Return error message
        };
    }

    // Trim whitespace and parse output
    const rawOutput = response.run.output.trim();
    
    return {
        passed: parseInt(rawOutput) === testCase.expected,
        output: rawOutput
    };

}

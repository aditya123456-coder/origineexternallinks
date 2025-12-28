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
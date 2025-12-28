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
    javascript: { language: "javascript", version: "18.15.0" }
};

export async function secondSmallestinarray(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;
    
    // Format array for injection
    const arrString = testCase.arr.join(", ");

    if (currentlang == "c") {
        fullcode = `#include<stdio.h>
#include<limits.h>

${userCode}

int main(){
    int arr[] = {${arrString}};
    int size = ${testCase.size};
    printf("%d", secondSmallest(arr, size));
    return 0;
}`;
    }
    else if (currentlang == "cpp") {
        fullcode = `#include<iostream>
#include<vector>
#include<algorithm>
#include<climits>
using namespace std;

${userCode}

int main(){
    vector<int> arr = {${arrString}};
    cout << secondSmallest(arr);
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
        System.out.print(sol.secondSmallest(arr));
    }
}`;
    }
    else if (currentlang == "javascript") {
        fullcode = `
${userCode}

const arr = [${arrString}];
console.log(secondSmallest(arr));
`;
    }

    const response = await executeCode(fullcode, lang);

    if (response.run.code !== 0) {
        return {
            passed: false,
            output: response.run.stderr || response.run.output
        };
    }

    return {
        passed: parseInt(response.run.output.trim()) === testCase.expected,
        output: response.run.output
    };
}
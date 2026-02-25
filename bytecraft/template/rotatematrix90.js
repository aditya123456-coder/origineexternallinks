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

export async function rotatematrix90(userCode, testCase, currentlang) {
    const lang = LANGUAGE_CONFIG[currentlang];

    // 🔹 Convert Firestore object → 2D array
    const matrixArr = [];
    for (let i = 0; i < testCase.n; i++) {
        matrixArr.push(testCase.matrix[`r${i}`]);
    }

    const matrixCStyle = matrixArr
        .map(r => `{${r.join(",")}}`)
        .join(",");

    let fullcode = "";

    if (currentlang === "c") {
        fullcode = `#include<stdio.h>
${userCode}
int main(){
    int n=${testCase.n};
    int mat[100][100]={${matrixCStyle}};
    rotate90(mat,n);
    for(int i=0;i<n;i++)
        for(int j=0;j<n;j++)
            printf("%d ",mat[i][j]);
}`;
    }

    if (currentlang === "cpp") {
        fullcode = `#include <iostream>
using namespace std;
${userCode}
int main(){
    int n=${testCase.n};
    int mat[100][100]={${matrixCStyle}};
    rotate90(mat,n);
    for(int i=0;i<n;i++)
        for(int j=0;j<n;j++)
            cout<<mat[i][j]<<" ";
}`;
    }

    if (currentlang === "java") {
        fullcode = `class Main{
${userCode}
public static void main(String[] args){
    int n=${testCase.n};
    int[][] mat=${JSON.stringify(matrixArr)};
    rotate90(mat,n);
    for(int i=0;i<n;i++)
        for(int j=0;j<n;j++)
            System.out.print(mat[i][j]+" ");
}}`;
    }

    if (currentlang === "javascript") {
        fullcode = `${userCode}
let mat=${JSON.stringify(matrixArr)};
rotate90(mat,${testCase.n});
let out="";
for(let i=0;i<${testCase.n};i++)
 for(let j=0;j<${testCase.n};j++)
  out+=mat[i][j]+" ";
console.log(out);`;
    }

    const res = await executeCode(fullcode, lang);
    return {
        passed: res.run.output.trim() === testCase.expected.join(" "),
        output: res.run.output
    };
}


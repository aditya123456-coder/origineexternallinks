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

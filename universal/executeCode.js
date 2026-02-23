export async function executeCode(code, language) {

    const JUDGE0_API = "https://judge0-ce.p.rapidapi.com"; 
    // If NOT using RapidAPI, replace with:
    // const JUDGE0_API = "https://ce.judge0.com";

    const LANGUAGE_MAP = {
        c: 50,
        cpp: 54,
        python: 71,
        java: 62,
        javascript: 63,
        php: 68,
        go: 60,
        ruby: 72,
        kotlin: 78,
        csharp: 51,
        swift: 83
    };

    const language_id = LANGUAGE_MAP[language];

    if (!language_id) {
        return {
            stdout: "",
            stderr: "Language not supported",
            output: "Language not supported",
            code: -1,
            signal: null,
            language,
            version: null
        };
    }

    try {

        // STEP 1: Create submission
        const createRes = await fetch(`${JUDGE0_API}/submissions?base64_encoded=false&wait=true`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Required ONLY if using RapidAPI:
                // "X-RapidAPI-Key": "YOUR_API_KEY",
                // "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
            },
            body: JSON.stringify({
                source_code: code,
                language_id: language_id
            })
        });

        if (!createRes.ok) {
            throw new Error("Execution request failed");
        }

        const result = await createRes.json();

        return {
            stdout: result.stdout || "",
            stderr: result.stderr || result.compile_output || "",
            output: (result.stdout || "") + (result.stderr || "") + (result.compile_output || ""),
            code: result.status?.id || 0,
            signal: null,
            language,
            version: null
        };

    } catch (err) {
        return {
            stdout: "",
            stderr: err.message,
            output: err.message,
            code: -1,
            signal: null,
            language,
            version: null
        };
    }
}

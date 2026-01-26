export async function executeCode(code, language) {
    const PISTON_API = "https://emkc.org/api/v2/piston";

    const LANGUAGE_MAP = {
        c: "c",
        cpp: "c++",
        python: "python",
        java: "java",
        javascript: "javascript",
        php: "php",
        go: "go",
        ruby: "ruby",
        kotlin: "kotlin",
        csharp: "csharp",
        swift: "swift"
    };

    const pistonLang = LANGUAGE_MAP[language] || language;

    try {
        const runtimesRes = await fetch(`${PISTON_API}/runtimes`);
        if (!runtimesRes.ok) throw new Error("Failed to fetch runtimes");

        const runtimes = await runtimesRes.json();
        const matches = runtimes.filter(r => r.language === pistonLang);

        if (!matches.length) {
            throw new Error(`Language not supported: ${pistonLang}`);
        }

        const latest = matches.sort((a, b) =>
            a.version.localeCompare(b.version, undefined, { numeric: true })
        ).at(-1);

        const version = latest.version;

        // 🔥 FIX: unescape newlines and tabs
        const normalizedCode = code
            .replace(/\\n/g, "\n")
            .replace(/\\t/g, "\t")
            .replace(/\\r/g, "\r");

        const execRes = await fetch(`${PISTON_API}/execute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                language: pistonLang,
                version,
                files: [{ content: normalizedCode }]
            })
        });

        if (!execRes.ok) {
            throw new Error("Execution request failed");
        }

        const result = await execRes.json();

        return {
            stdout: result.run?.stdout || "",
            stderr: result.run?.stderr || "",
            output: (result.run?.stdout || "") + (result.run?.stderr || ""),
            code: result.run?.code,
            signal: result.run?.signal,
            language: pistonLang,
            version
        };

    } catch (err) {
        return {
            stdout: "",
            stderr: err.message,
            output: err.message,
            code: -1,
            signal: null,
            language: pistonLang,
            version: null
        };
    }
}

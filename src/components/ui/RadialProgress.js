export default function RadialProgress({ progress = 0 }) {
    const radius = 30; // Reduced radius
    const circumference = 2 * Math.PI * radius;

    // Ensure progress is a number and is between 0 and 100
    const safeProgress = isNaN(progress)
        ? 0
        : Math.min(100, Math.max(0, progress));
    const strokeDashoffset =
        circumference - (safeProgress / 100) * circumference;

    return (
        <div className="flex justify-center items-center">
            <svg width="80" height="80" viewBox="0 0 80 80">
                {" "}
                {/* Reduced SVG dimensions */}
                <circle
                    cx="40" // Adjusted center x-coordinate
                    cy="40" // Adjusted center y-coordinate
                    r={radius}
                    fill="none"
                    stroke="#e6e6e6"
                    strokeWidth="8" // Optionally adjust the stroke width
                />
                <circle
                    cx="40" // Adjusted center x-coordinate
                    cy="40" // Adjusted center y-coordinate
                    r={radius}
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="8" // Optionally adjust the stroke width
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 40 40)" // Adjusted rotation center
                />
            </svg>
        </div>
    );
}

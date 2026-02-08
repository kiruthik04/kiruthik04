function calculateStats(user) {
    let totalStars = 0;
    let totalCommits = user.contributionsCollection.totalCommitContributions + (user.contributionsCollection.restrictedContributionsCount || 0);
    let totalPRs = user.pullRequests.totalCount;
    let totalIssues = user.issues.totalCount;
    // let totalFollowers = user.followers.totalCount; // Not typically shown in basic stats card but good to have

    user.repositories.nodes.forEach(repo => {
        totalStars += repo.stargazers.totalCount;
    });

    return {
        totalStars,
        totalCommits,
        totalPRs,
        totalIssues,
        // totalFollowers
    };
}

function calculateLanguages(user) {
    const langMap = {};
    let totalSize = 0;

    user.repositories.nodes.forEach(repo => {
        repo.languages.edges.forEach(edge => {
            const { size, node } = edge;
            const { name, color } = node;

            if (!langMap[name]) {
                langMap[name] = { size: 0, color, name };
            }
            langMap[name].size += size;
            totalSize += size;
        });
    });

    const languages = Object.values(langMap)
        .sort((a, b) => b.size - a.size)
        .slice(0, 5) // Top 5 languages
        .map(lang => ({
            ...lang,
            percentage: ((lang.size / totalSize) * 100).toFixed(1)
        }));

    return languages;
}

module.exports = { calculateStats, calculateLanguages };

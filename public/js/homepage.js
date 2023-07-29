// ---- SHOW START DISCUSSION ---- //
const   discussionMenu = document.querySelector(".discussion-board-nav"),
        startDiscussion = discussionMenu.querySelector(".start-discussion-btn"),
        writePost = document.querySelector(".write-post-border"),
        exitPost = document.querySelector(".close-post"),
        submitPost = document.querySelector(".submit-btn");

// opens and closes write post
startDiscussion.addEventListener("click", () => writePost.classList.toggle("active"));
exitPost.addEventListener("click", () => writePost.classList.remove("active"));

// submit post
submitPost.addEventListener("click", () =>{
    // add code here to add details to database
    writePost.classList.remove("active");
})

// truncates long titles
function truncateParagraph(paragraph, maxLength) {
    if (paragraph.length <= maxLength) {
        return paragraph;
    } else {
        return paragraph.slice(0, maxLength - 3) + '...';
    }
}

const   postTitle = document.querySelector("#post-title").textContent,
        truncatedParagraph = truncateParagraph(longParagraph, 50);

        document.querySelector("#post-title").textContent = truncateParagraph;
<header>
from moviepy.editor import ColorClip, TextClip, CompositeVideoClip, concatenate_videoclips
from moviepy.video.fx.all import fadein, fadeout

# Video settings
width, height = 720, 1280  # Video resolution
fps = 24                   # Frames per second

def create_scene(text, duration, bg_color):
    """
    Creates a scene with a colored background and centered text.
    """
    # Create a background clip
    background = ColorClip(size=(width, height), color=bg_color, duration=duration)
    # Create a text clip
    txt_clip = TextClip(
        text,
        fontsize=70,
        color='black',
        font="Arial-Bold",
        method='caption',
        size=(width-100, None)
    ).set_duration(duration).set_position('center')
    # Combine background and text
    scene = CompositeVideoClip([background, txt_clip])
    return scene

# Define each scene based on the storyboard

# Scene 1: Introduction (Signature Piece Remix Challenge)
scene1 = create_scene(
    "Signature Piece Remix Challenge\nOne item. Three iconic looks.",
    duration=3,
    bg_color=(240, 240, 240)
)

# Scene 2: Look #1 – Casual Vibes
scene2 = create_scene(
    "Casual Vibes",
    duration=9,
    bg_color=(220, 220, 255)
)

# Scene 3: Look #2 – Edgy Evening
scene3 = create_scene(
    "Edgy Evening",
    duration=9,
    bg_color=(255, 220, 220)
)

# Scene 4: Look #3 – Chic & Professional
scene4 = create_scene(
    "Chic & Professional",
    duration=7,
    bg_color=(220, 255, 220)
)

# Scene 5: Call-to-Action
scene5 = create_scene(
    "Which look is your favorite?\nTag @YourHandle in your remix challenge!",
    duration=3,
    bg_color=(240, 240, 240)
)

# Optionally, add fade in/out transitions for each scene
scene1 = scene1.fx(fadein, 0.5).fx(fadeout, 0.5)
scene2 = scene2.fx(fadein, 0.5).fx(fadeout, 0.5)
scene3 = scene3.fx(fadein, 0.5).fx(fadeout, 0.5)
scene4 = scene4.fx(fadein, 0.5).fx(fadeout, 0.5)
scene5 = scene5.fx(fadein, 0.5).fx(fadeout, 0.5)

# Concatenate all scenes into a final video
final_video = concatenate_videoclips([scene1, scene2, scene3, scene4, scene5])

# Write the result to a file
final_video.write_videofile("signature_piece_remix_challenge_demo.mp4", fps=fps)

<!--
  <<< Author notes: Course header >>>
  Include a 1280×640 image, course title in sentence case, and a concise description in emphasis.
  In your repository settings: enable template repository, add your 1280×640 social image, auto delete head branches.
  Add your open source license, GitHub uses MIT license.
-->

# Introduction to GitHub

_Get started using GitHub in less than an hour._

</header>

<!--
  <<< Author notes: Course start >>>
  Include start button, a note about Actions minutes,
  and tell the learner why they should take the course.
-->

## Welcome

People use GitHub to build some of the most advanced technologies in the world. Whether you’re visualizing data or building a new game, there’s a whole community and set of tools on GitHub that can help you do it even better. GitHub Skills’ “Introduction to GitHub” course guides you through everything you need to start contributing in less than an hour.

- **Who is this for**: New developers, new GitHub users, and students.
- **What you'll learn**: We'll introduce repositories, branches, commits, and pull requests.
- **What you'll build**: We'll make a short Markdown file you can use as your [profile README](https://docs.github.com/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme).
- **Prerequisites**: None. This course is a great introduction for your first day on GitHub.
- **How long**: This course takes less than one hour to complete.

In this course, you will:

1. Create a branch
2. Commit a file
3. Open a pull request
4. Merge your pull request

### How to start this course

<!-- For start course, run in JavaScript:
'https://github.com/new?' + new URLSearchParams({
  template_owner: 'skills',
  template_name: 'introduction-to-github',
  owner: '@me',
  name: 'skills-introduction-to-github',
  description: 'My clone repository',
  visibility: 'public',
}).toString()
-->

[![start-course](https://user-images.githubusercontent.com/1221423/235727646-4a590299-ffe5-480d-8cd5-8194ea184546.svg)](https://github.com/new?template_owner=skills&template_name=introduction-to-github&owner=%40me&name=skills-introduction-to-github&description=My+clone+repository&visibility=public)

1. Right-click **Start course** and open the link in a new tab.
2. In the new tab, most of the prompts will automatically fill in for you.
   - For owner, choose your personal account or an organization to host the repository.
   - We recommend creating a public repository, as private repositories will [use Actions minutes](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions).
   - Scroll down and click the **Create repository** button at the bottom of the form.
3. After your new repository is created, wait about 20 seconds, then refresh the page. Follow the step-by-step instructions in the new repository's README.

<footer>

<!--
  <<< Author notes: Footer >>>
  Add a link to get support, GitHub status page, code of conduct, license link.
-->

---

Get help: [Post in our discussion board](https://github.com/orgs/skills/discussions/categories/introduction-to-github) &bull; [Review the GitHub status page](https://www.githubstatus.com/)

&copy; 2024 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

</footer>

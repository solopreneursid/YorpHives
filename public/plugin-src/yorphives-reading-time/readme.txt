=== YorpHives Reading Time ===
Contributors: yorphives
Tags: reading-time, shortcode, publishing
Requires at least: 6.0
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later

Adds the [yorphives_reading_time] shortcode. Place it in a post, page or compatible shortcode block to display an estimated reading time.

Attributes:
- wpm: words per minute, clamped to 80–600; default 220.
- label: text before the estimate; default "Reading time:".
- suffix: text after the minute count; default "min read".

Example: [yorphives_reading_time wpm="200" label="About" suffix="minutes"]

No external services, tracking, or paid APIs are used. The estimate is approximate and does not account for every language or reading style.
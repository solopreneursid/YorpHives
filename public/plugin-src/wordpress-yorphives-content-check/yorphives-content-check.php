<?php
/**
 * Plugin Name: YorpHives Content Check
 * Description: A lightweight editorial checklist for WordPress posts and pages. Checks title, excerpt, headings, links, images and content length without external services.
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: YorpHives
 * License: GPL-2.0-or-later
 * Text Domain: yorphives-content-check
 */
if (!defined('ABSPATH')) { exit; }
final class YorpHives_Content_Check {
    public function __construct() {
        add_action('add_meta_boxes', array($this, 'add_box'));
        add_action('admin_enqueue_scripts', array($this, 'assets'));
    }
    public function add_box() {
        foreach (array('post', 'page') as $type) {
            add_meta_box('yorphives-content-check', 'YorpHives Content Check', array($this, 'render_box'), $type, 'side', 'high');
        }
    }
    public function assets($hook) {
        if (!in_array($hook, array('post.php', 'post-new.php'), true)) { return; }
        wp_enqueue_script('yorphives-content-check', plugin_dir_url(__FILE__) . 'content-check.js', array(), '1.0.0', true);
        wp_enqueue_style('yorphives-content-check', plugin_dir_url(__FILE__) . 'content-check.css', array(), '1.0.0');
    }
    public function render_box($post) {
        if (!current_user_can('edit_post', $post->ID)) { return; }
        echo '<div id="yorphives-content-check-panel" class="yhcc-panel"><p class="yhcc-intro">A local checklist. Nothing is sent to YorpHives or any external service.</p><button type="button" class="button button-primary" id="yhcc-run">Check this draft</button><ul id="yhcc-results" aria-live="polite"><li>Run a check to review this draft.</li></ul><p class="yhcc-foot">Suggestions are advisory; they do not guarantee SEO, accessibility or editorial quality.</p></div>';
    }
}
new YorpHives_Content_Check();
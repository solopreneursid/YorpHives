<?php
/**
 * Plugin Name: YorpHives Reading Time
 * Description: Adds a [yorphives_reading_time] shortcode that estimates reading time for the current post using a configurable words-per-minute rate.
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: YorpHives
 * License: GPL-2.0-or-later
 */
if (!defined('ABSPATH')) { exit; }
function yhrt_reading_time($atts = array()) { $atts = shortcode_atts(array('wpm'=>'220','label'=>'Reading time:','suffix'=>'min read'),$atts,'yorphives_reading_time'); $post = get_post(); if (!$post) return ''; $wpm = max(80, min(600, absint($atts['wpm']) ?: 220)); $content = strip_shortcodes($post->post_content); $content = wp_strip_all_tags($content); $content = html_entity_decode($content, ENT_QUOTES, get_bloginfo('charset') ?: 'UTF-8'); $words = str_word_count($content); $minutes = max(1, (int) ceil($words / $wpm)); $label = sanitize_text_field($atts['label']); $suffix = sanitize_text_field($atts['suffix']); return '<span class="yorphives-reading-time">' . esc_html(trim($label . ' ' . $minutes . ' ' . $suffix)) . '</span>'; }
add_shortcode('yorphives_reading_time','yhrt_reading_time');
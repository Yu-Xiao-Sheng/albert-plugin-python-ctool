#!/usr/bin/env python3
"""Launch a Ctool popup window using GTK + WebKit2."""
import sys
import gi
gi.require_version('Gtk', '3.0')
gi.require_version('WebKit2', '4.1')
from gi.repository import Gtk, WebKit2, Gdk


def main():
    if len(sys.argv) < 2:
        print("Usage: ctool_popup.py <url> [title]")
        sys.exit(1)

    url = sys.argv[1]
    title = sys.argv[2] if len(sys.argv) > 2 else "Ctool"

    win = Gtk.Window(title=title)
    win.set_default_size(1100, 750)
    win.set_position(Gtk.WindowPosition.CENTER)

    scrolled = Gtk.ScrolledWindow()
    scrolled.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)

    webview = WebKit2.WebView()
    webview.load_uri(url)
    scrolled.add(webview)

    win.add(scrolled)
    win.connect("destroy", Gtk.main_quit)
    win.show_all()

    Gtk.main()


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Reduziert die Lautstaerke einer MP3-Datei um einen prozentualen Faktor."""

import argparse
import math
import sys

try:
    from pydub import AudioSegment
except ImportError:
    sys.exit("pydub fehlt. Installieren mit: pip install pydub (ausserdem wird ffmpeg benoetigt)")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", help="Pfad zur Eingabe-MP3")
    parser.add_argument("output", help="Pfad zur Ausgabe-MP3")
    parser.add_argument(
        "percent",
        type=float,
        help="Ziel-Lautstaerke in Prozent der Originallautstaerke (z.B. 60 fuer 60%%)",
    )
    args = parser.parse_args()

    if args.percent <= 0:
        sys.exit("percent muss groesser als 0 sein.")

    audio = AudioSegment.from_mp3(args.input)

    # Lautstaerke ist logarithmisch (dB), daher Umrechnung von linearem Faktor in dB
    factor = args.percent / 100
    gain_db = 20 * math.log10(factor)

    quieter = audio.apply_gain(gain_db)
    quieter.export(args.output, format="mp3")
    print(f"Fertig: {args.output} ({args.percent:.0f}% der Originallautstaerke, {gain_db:.1f} dB)")


if __name__ == "__main__":
    main()

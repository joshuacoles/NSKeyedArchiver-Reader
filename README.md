# NSKeyedArchiver Reader

A simple script to read data from an `NSKeyedArchiver` binary plist.

In my specific use case these are obtained by cracking open a CoreData sqlite file,
but I hope this may be useful in similar sitations.


## "Method"

1. Get some binary plists.
    - For me this was `sqlite3 db.sqlite "SELECT writefile('znotes_' || Z_PK || '.plist', ZNOTES) FROM ZBOOKNOTE WHERE ZNOTES IS NOT NULL"`
2. Use `convert-plist-to-json.ts` to convert these into unprocessed json.
3. Use [quicktype](https://quicktype.io) to get a type schema for this json.
    - There is currently a mess of one in this repo.
    - The main points you should care about are:
        - The `Classes` enum
        - Values of `NS.special`
        - Which values of `Classes` actually appear in `$class` and which are just in
          the `$classes` list. These are the `RealisedClasses` you actually have to handle.
4. Iterative changes to d2 until you get something you like.
    - This is very much a splunking process unfortunately.

## Scripts

- `convert-plist-to-json.ts`, useful if you need to inspect the json output from
  `bplist-parser`.
- `d2.ts` actually run the converter.

## Useful links 

- https://www.mac4n6.com/blog/2016/1/1/manual-analysis-of-nskeyedarchiver-formatted-plist-files-a-review-of-the-new-os-x-1011-recent-items
- NSValue NS.special codes, https://github.com/apple/swift-corelibs-foundation/blob/main/Sources/Foundation/NSSpecialValue.swift#L36

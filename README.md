# NSKeyedArchiver Reader

A simple script to read data from an `NSKeyedArchiver` binary plist.

In my specific use case these are obtained by cracking open a CoreData sqlite file,
but I hope this may be useful in similar sitations.

## Useful links 

- https://www.mac4n6.com/blog/2016/1/1/manual-analysis-of-nskeyedarchiver-formatted-plist-files-a-review-of-the-new-os-x-1011-recent-items
- NSValue NS.special codes, https://github.com/apple/swift-corelibs-foundation/blob/main/Sources/Foundation/NSSpecialValue.swift#L36

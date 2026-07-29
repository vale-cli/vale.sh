# Vocabularies

Learn about Vale's terminology management system.

Vocabularies allow you to maintain custom lists of terminology independent of your styles.

```ini
StylesPath = "..."

# Here's were we define the exceptions to use in *all*
# `BasedOnStyles`.
Vocab = Some-Name

[*]
# 'Vale' and 'MyStyle' automatically respect all
# custom exceptions.
#
# The built-in 'Vale' style is required for using
# `Vale.Terms`, `Vale.Avoid`, or `Vale.Spelling`.
BasedOnStyles = Vale, MyStyle
```

Each `Vocab` is a single folder (stored at `<StylesPath>/config/vocabularies/<name>/`) consisting of two plain-text files—`accept.txt` and `reject.txt`—that contain one regular expression per line.

The effects of using a custom `Vocab` are as follows:

* Entries in `accept.txt` are added to every exception list in all styles listed in `BasedOnStyles`—meaning that you now only need to update your project’s _vocabulary_ to customize third-party styles.
* Entries in `accept.txt` are automatically added to a substitution rule (`Vale.Terms`), ensuring that any occurrences of these words or phrases exactly match their corresponding entry in `accept.txt`.
* Entries in `reject.txt` are automatically added to an existence rule (`Vale.Avoid`) that will flag all occurrences as errors.
* Entries in `accept.txt` and `reject.txt` should need little overlap, if any. For example, if you add `JavaScript` to `accept.txt`, then you do not need to add an overlapping regular expression entry of `[Jj]avascript` in `reject.txt`. Vale will enforce correct casing by virtue of the entry’s presence in `accept.txt`. See the section “Case sensitivity” for details.

This means that your exceptions can be developed independent of a style, allowing you to use the same exceptions with multiple styles or switch styles without having to re-implement them.

{% hint style="warning" %}
Heads up!

In versions of Vale prior to 3.0, vocabularies were stored in `<StylesPath>/Vocab`. When upgrading from an older version of Vale, you'll need to move your vocabularies to the new `<StylesPath>/config/vocabularies` location.
{% endhint %}

Vocabulary entries are stored in `<StylesPath>/config/vocabularies/<name>/` and are then referenced by `<name>` in `.vale.ini`. For example, consider the following folder structure:

```
$ tree styles
├───MyStyle
├───config
│   └───vocabularies
│       ├───Blog
│       │   ├───accept.txt
│       │   └───reject.txt
│       └───Marketing
│           ├───accept.txt
│           └───reject.txt
└───MyOtherStyle
```

Here, our `StylesPath` (`/styles`) contains two styles (`MyStyle` and `MyOtherStyle`) and two vocabularies (`Blog` and `Marketing`). You can then reference these entries by their folder name:

```ini
StylesPath = styles

Vocab = Blog

[*]
BasedOnStyles = Vale, MyStyle
```

## File format

Both `accept.txt` and `reject.txt` are plain-text files that take one entry per line:

```
first
[pP]y.*\b
third
```

The entries are evaluated as case-sensitive (except for rules extending `spelling`, as mentioned above) regular expressions.

Lines starting with `#` are treated as comments and are ignored.

## Case sensitivity

An important factor in successfully implementing a custom vocabulary is understanding how Vale handles case sensitivity.

While most spell-checking tools ignore case altogether, Vale’s vocabulary files are case-aware by default. This means that, for example, a vocabulary consisting of

```
MongoDB
```

will enforce the _exact_ use of “MongoDB”: “mongoDB,” “MongoDb,” etc., will all result in errors. There are two ways around this.

First, you can indicate that a given entry should be case-insensitive by providing an appropriate regular expression:

```
(?i)MongoDB
[Oo]bservability
```

The first entry, `(?i)MongoDB`, marks the entire pattern as case-insensitive while the second, `[Oo]bservability`, provides two acceptable options.

You can also disable `Vale.Terms` and just use `Vale.Spelling`:

```ini
[*.md]
BasedOnStyles = Vale

Vale.Terms = NO
```

This will provide a more traditional spell-checking experience.

## Relation to ignore files

The functionality of vocabularies is similar to the existing concept of [ignore files](../checks/spelling.md#ignore-files).

The major differences are that vocabularies apply to multiple extension points (rather than just `spelling`), support regular expressions, and have built-in rules associated with them (`Vale.Terms` and `Vale.Avoid`).

In general, this means that ignore files are for style _creators_ while vocabularies are for style _users_:

* If you’re developing or maintaining a style, you may still want to include a custom `spelling` rule—`MyStyle.Spelling`—that packages its own ignore files.
* As a user of styles, vocabularies should be able to replace the use of ignore files completely.

## Rules targeting vocabulary entries

In cases where you want to write a rule that needs to match against an otherwise-ignored token, you can add `vocab: false` to the rule definition. For example,

```yaml
extends: existence
message: Did you mean '%s'?
vocab: false
tokens:
  # "MonoDB" can be in a vocab
  - MongoDB
```

[Packages](packages.md) [MinAlertLevel](minalertlevel.md)

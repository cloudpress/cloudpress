What is Cloudpress?
===================

Cloudpress is [Octopress](https://github.com/imathis/octopress) with integrated support for deployment to amazon web service's cloudfront backed by an s3 origin.

How Do I Use This?
------------------

For most operations, except for deployment, refer to the [Octopress documentation](http://octopress.org/docs).

How Do I Deploy To Cloudfront Backed By S3?
-------------------------------------------

The blog post [Host An Octopress Based Blog On Cloudfront With An S3 Origin With A Custom Domain Using Route53 For DNS by Using Cloudpress](http://www.david-j-nelson.com/coming_soon) has thorough instructions for how to do this.

How Do I Update Cloudpress With The Latest Changes From Octopress?
------------------------------------------------------------------

`git remote add upstream https://github.com/imathis/octopress.git`  
`git fetch upstream`

Why Not Just Submit A Pull Request To Octopress For This?
---------------------------------------------------------

There was a [pull request submitted by the original author](https://github.com/imathis/octopress/pull/175), but it was declined.

License
-------

(The MIT License)

Copyright 2009-2012 Brandon Mathis  
Copyright 2011, 2012 Jerome Bernard  
Copyright 2012 David Nelson  

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the ‘Software’), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED ‘AS IS’, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import Image from "next/image";
import Link from "next/link";

import Header from "@/components/shared/Header";
import TransformedImage from "@/components/shared/TransformedImage";
import { Button } from "@/components/ui/button";

import { getImageSize } from "@/lib/utils";
import { DeleteConfirmation } from "@/components/shared/DeleteConfirmation";
import { auth } from "@clerk/nextjs/server";
import { getImageById } from "@/lib/actions/image.action";

// Define the types to match your data structure
interface IAuthor {
  clerkId: string;
}

interface IImage {
  _id: string;
  title: string;
  transformationType: string;
  prompt?: string;
  color?: string;
  aspectRatio?: string; // Keep it optional, but we will ensure it is a string before use
  secureURL: string;
  author?: IAuthor;
  config?: object;
}

const ImageDetails = async ({ params: { id } }: { params: { id: string } }) => {
  const { userId } = auth();

  const image = (await getImageById(id)) as IImage | null;

  // Check if the image exists
  if (!image) {
    return (
      <section>
        <h2>Image not found</h2>
        <p>The image you are looking for does not exist or has been deleted.</p>
      </section>
    );
  }

  // Use a fallback value for aspectRatio if it's undefined
  const aspectRatio = image.aspectRatio ?? "1:1"; // Fallback to "1:1" or some other valid string

  return (
    <>
      <Header title={image.title} />

      <section className="mt-5 flex flex-wrap gap-4">
        <div className="p-14-medium md:p-16-medium flex gap-2">
          <p className="text-dark-600">Transformation:</p>
          <p className="capitalize text-purple-400">
            {image.transformationType}
          </p>
        </div>

        {image.prompt && (
          <>
            <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-dark-600">Prompt:</p>
              <p className="capitalize text-purple-400">{image.prompt}</p>
            </div>
          </>
        )}

        {image.color && (
          <>
            <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-dark-600">Color:</p>
              <p className="capitalize text-purple-400">{image.color}</p>
            </div>
          </>
        )}

        {image.aspectRatio && (
          <>
            <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-dark-600">Aspect Ratio:</p>
              <p className="capitalize text-purple-400">{aspectRatio}</p>
            </div>
          </>
        )}
      </section>

      <section className="mt-10 border-t border-dark-400/15">
        <div className="transformation-grid">
          {/* ORIGINAL IMAGE */}
          <div className="flex flex-col gap-4">
            <h3 className="h3-bold text-dark-600">Original</h3>

            <Image
              width={getImageSize(image.transformationType, { ...image, aspectRatio: image.aspectRatio ?? "1:1" }, "width")}
              height={getImageSize(image.transformationType, { ...image, aspectRatio: image.aspectRatio ?? "1:1" }, "height")}
              src={image.secureURL}
              alt="image"
              className="transformation-original_image"
/>
          </div>

          {/* TRANSFORMED IMAGE */}
          <TransformedImage
            image={image}
            type={image.transformationType}
            title={image.title}
            isTransforming={false}
            transformationConfig={image.config || null}
            hasDownload={true}
          />
        </div>

        {userId === image.author?.clerkId && image._id && (
          <div className="mt-4 space-y-4">
            <Button asChild type="button" className="submit-button capitalize">
              <Link href={`/transformations/${image._id}/update`}>
                Update Image
              </Link>
            </Button>

            <DeleteConfirmation imageId={image._id} />
          </div>
        )}
      </section>
    </>
  );
};

export default ImageDetails;

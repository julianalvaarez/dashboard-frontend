import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, Trash } from "lucide-react";
import { Label } from "./ui/Label";

export const VideoInputList = ({ video = [''], onVideoChange, addVideoInput, removeVideoInput }) => {
    return (
        <div className="grid gap-3">
            <Label>Videos</Label>
            <div className="flex flex-col gap-2">
                {video.map((url, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <Input
                            placeholder="Link del video"
                            value={url}
                            onChange={(e) => onVideoChange(index, e.target.value)}
                            className="flex-1"
                        />
                        <div className="flex gap-1">
                            {index === video.length - 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={addVideoInput}
                                    className="h-9 w-9"
                                    title="Agregar video"
                                >
                                    <Plus size={16} />
                                </Button>
                            )}
                            {video.length > 1 && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => removeVideoInput(index)}
                                    className="h-9 w-9"
                                    title="Eliminar video"
                                >
                                    <Trash size={16} />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

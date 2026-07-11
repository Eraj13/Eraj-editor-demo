import { DeleteButtonProps } from "../core/types";
import { DeleteIcon } from "../utils/constants";
import './DeleteButton.css';


export const DeleteButton: React.FC<DeleteButtonProps> = ({
  nodeTag,
  lngD,
  visibility, 
  onClick
}) => {

  return(
    <button className={`delete-btn ${nodeTag === "li" ? "list" :''}
      ${visibility? '' : 'disappear'}`} 
      onClick={onClick}>
        {DeleteIcon({className: lngD})}
    </button>
  )

}